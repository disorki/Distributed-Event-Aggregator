package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/IBM/sarama"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ────────────────────────────────────────────────────────────
// Models
// ────────────────────────────────────────────────────────────

// IngestRequest is the strict schema for incoming events.
type IngestRequest struct {
	Source  string                 `json:"source"  binding:"required,min=1"`
	Payload map[string]interface{} `json:"payload" binding:"required"`
}

// EventEnvelope wraps the raw event before it goes into Kafka.
type EventEnvelope struct {
	ID        string                 `json:"id"`
	Source    string                 `json:"source"`
	Payload  map[string]interface{} `json:"payload"`
	Timestamp string                 `json:"timestamp"`
}

// MongoEvent mirrors the MongoDB document for reads.
type MongoEvent struct {
	ID        string                 `bson:"_id"       json:"id"`
	Source    string                 `bson:"source"    json:"source"`
	Payload  map[string]interface{} `bson:"payload"   json:"payload"`
	Analysis  map[string]interface{} `bson:"analysis"  json:"analysis"`
	Timestamp string                 `bson:"timestamp" json:"timestamp"`
}

// ────────────────────────────────────────────────────────────
// Globals
// ────────────────────────────────────────────────────────────

var (
	kafkaProducer sarama.AsyncProducer
	mongoClient   *mongo.Client
	eventsCol     *mongo.Collection
)

// ────────────────────────────────────────────────────────────
// Helpers / Config
// ────────────────────────────────────────────────────────────

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// ────────────────────────────────────────────────────────────
// Kafka
// ────────────────────────────────────────────────────────────

func initKafka() {
	brokers := strings.Split(env("KAFKA_BROKERS", "localhost:9092"), ",")

	cfg := sarama.NewConfig()
	cfg.Producer.Return.Successes = false        // fire-and-forget for speed
	cfg.Producer.Return.Errors = true
	cfg.Producer.RequiredAcks = sarama.WaitForLocal
	cfg.Producer.Compression = sarama.CompressionSnappy
	cfg.Producer.Retry.Max = 5
	cfg.Net.DialTimeout = 30 * time.Second
	cfg.Net.ReadTimeout = 30 * time.Second
	cfg.Net.WriteTimeout = 30 * time.Second
	cfg.Metadata.Retry.Max = 10
	cfg.Metadata.Retry.Backoff = 2 * time.Second

	var err error
	for i := 0; i < 30; i++ {
		kafkaProducer, err = sarama.NewAsyncProducer(brokers, cfg)
		if err == nil {
			break
		}
		log.Printf("[kafka] waiting for broker... attempt %d/30: %v", i+1, err)
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		log.Fatalf("[kafka] failed to connect: %v", err)
	}

	// Drain errors in background
	go func() {
		for e := range kafkaProducer.Errors() {
			log.Printf("[kafka] produce error: %v", e.Err)
		}
	}()

	log.Println("[kafka] async producer ready")
}

func publishToKafka(topic string, payload []byte) {
	kafkaProducer.Input() <- &sarama.ProducerMessage{
		Topic: topic,
		Value: sarama.ByteEncoder(payload),
	}
}

// ────────────────────────────────────────────────────────────
// MongoDB
// ────────────────────────────────────────────────────────────

func initMongo() {
	uri := env("MONGO_URI", "mongodb://localhost:27017")
	dbName := env("MONGO_DB", "pipeline")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var err error
	for i := 0; i < 15; i++ {
		mongoClient, err = mongo.Connect(ctx, options.Client().ApplyURI(uri))
		if err == nil {
			if err = mongoClient.Ping(ctx, nil); err == nil {
				break
			}
		}
		log.Printf("[mongo] waiting for connection... attempt %d/15: %v", i+1, err)
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		log.Fatalf("[mongo] failed to connect: %v", err)
	}

	eventsCol = mongoClient.Database(dbName).Collection("events")

	// Create index on timestamp for efficient sorting
	_, _ = eventsCol.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "timestamp", Value: -1}},
	})

	log.Println("[mongo] connected, collection 'events' ready")
}

// ────────────────────────────────────────────────────────────
// Handlers
// ────────────────────────────────────────────────────────────

// POST /ingest — accept event, validate, publish to Kafka.
func handleIngest(c *gin.Context) {
	var req IngestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "validation_failed",
			"details": err.Error(),
		})
		return
	}

	// Ensure payload.text exists (needed for sentiment later)
	if _, ok := req.Payload["text"]; !ok {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "validation_failed",
			"details": "payload must contain a 'text' field",
		})
		return
	}

	envelope := EventEnvelope{
		ID:        uuid.New().String(),
		Source:    req.Source,
		Payload:  req.Payload,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}

	data, err := json.Marshal(envelope)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "marshal_failed"})
		return
	}

	publishToKafka("raw_events", data)

	c.JSON(http.StatusAccepted, gin.H{
		"status": "accepted",
		"id":     envelope.ID,
	})
}

// GET /api/events — return last N events from MongoDB.
func handleGetEvents(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	opts := options.Find().
		SetSort(bson.D{{Key: "timestamp", Value: -1}}).
		SetLimit(100)

	cursor, err := eventsCol.Find(ctx, bson.D{}, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	var events []MongoEvent
	if err := cursor.All(ctx, &events); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if events == nil {
		events = []MongoEvent{}
	}
	c.JSON(http.StatusOK, events)
}

// GET /api/events/stream — SSE endpoint: push new events every 2s.
func handleSSE(c *gin.Context) {
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no") // nginx compat

	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "streaming_not_supported"})
		return
	}

	lastTimestamp := ""
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	clientGone := c.Request.Context().Done()

	for {
		select {
		case <-clientGone:
			return
		case <-ticker.C:
			ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)

			filter := bson.D{}
			if lastTimestamp != "" {
				filter = bson.D{{Key: "timestamp", Value: bson.D{{Key: "$gt", Value: lastTimestamp}}}}
			}

			opts := options.Find().
				SetSort(bson.D{{Key: "timestamp", Value: 1}}).
				SetLimit(50)

			cursor, err := eventsCol.Find(ctx, filter, opts)
			if err != nil {
				cancel()
				continue
			}

			var events []MongoEvent
			if err := cursor.All(ctx, &events); err != nil {
				cursor.Close(ctx)
				cancel()
				continue
			}
			cursor.Close(ctx)
			cancel()

			for _, evt := range events {
				data, _ := json.Marshal(evt)
				fmt.Fprintf(c.Writer, "data: %s\n\n", data)
				lastTimestamp = evt.Timestamp
			}

			if len(events) > 0 {
				flusher.Flush()
			}
		}
	}
}

// GET /health — liveness probe.
func handleHealth(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// GET /api/stats — aggregated dashboard statistics from MongoDB.
func handleStats(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// --- Totals & sentiment breakdown ---
	pipeline := mongo.Pipeline{
		{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: nil},
			{Key: "total", Value: bson.D{{Key: "$sum", Value: 1}}},
			{Key: "avg_score", Value: bson.D{{Key: "$avg", Value: "$analysis.score"}}},
			{Key: "positive", Value: bson.D{{Key: "$sum", Value: bson.D{{Key: "$cond", Value: bson.A{bson.D{{Key: "$eq", Value: bson.A{"$analysis.sentiment", "Positive"}}}, 1, 0}}}}}},
			{Key: "neutral", Value: bson.D{{Key: "$sum", Value: bson.D{{Key: "$cond", Value: bson.A{bson.D{{Key: "$eq", Value: bson.A{"$analysis.sentiment", "Neutral"}}}, 1, 0}}}}}},
			{Key: "negative", Value: bson.D{{Key: "$sum", Value: bson.D{{Key: "$cond", Value: bson.A{bson.D{{Key: "$eq", Value: bson.A{"$analysis.sentiment", "Negative"}}}, 1, 0}}}}}},
			{Key: "last_event_at", Value: bson.D{{Key: "$max", Value: "$timestamp"}}},
		}}},
	}

	cursor, err := eventsCol.Aggregate(ctx, pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(ctx)

	type aggResult struct {
		Total       int     `bson:"total"        json:"total_events"`
		AvgScore    float64 `bson:"avg_score"    json:"avg_score"`
		Positive    int     `bson:"positive"     json:"-"`
		Neutral     int     `bson:"neutral"      json:"-"`
		Negative    int     `bson:"negative"     json:"-"`
		LastEventAt string  `bson:"last_event_at" json:"last_event_at"`
	}

	var results []aggResult
	if err := cursor.All(ctx, &results); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(results) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"total_events":       0,
			"avg_score":          0,
			"sentiment_breakdown": gin.H{"positive": 0, "neutral": 0, "negative": 0},
			"top_sources":        []string{},
			"last_event_at":      "",
		})
		return
	}

	r := results[0]

	// --- Top 5 sources ---
	srcPipeline := mongo.Pipeline{
		{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: "$source"},
			{Key: "count", Value: bson.D{{Key: "$sum", Value: 1}}},
		}}},
		{{Key: "$sort", Value: bson.D{{Key: "count", Value: -1}}}},
		{{Key: "$limit", Value: 5}},
	}

	srcCursor, err := eventsCol.Aggregate(ctx, srcPipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer srcCursor.Close(ctx)

	type srcEntry struct {
		Source string `bson:"_id"   json:"source"`
		Count  int    `bson:"count" json:"count"`
	}
	var topSources []srcEntry
	if err := srcCursor.All(ctx, &topSources); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total_events": r.Total,
		"avg_score":    fmt.Sprintf("%.4f", r.AvgScore),
		"sentiment_breakdown": gin.H{
			"positive": r.Positive,
			"neutral":  r.Neutral,
			"negative": r.Negative,
		},
		"top_sources":   topSources,
		"last_event_at": r.LastEventAt,
	})
}

// ────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	initKafka()
	initMongo()

	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery(), gin.Logger())

	// CORS — allow dashboard origin
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: false,
		MaxAge:           12 * time.Hour,
	}))

	r.POST("/ingest", handleIngest)
	r.GET("/api/events", handleGetEvents)
	r.GET("/api/events/stream", handleSSE)
	r.GET("/api/stats", handleStats)
	r.GET("/health", handleHealth)

	port := env("PORT", "8090")
	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	// Graceful shutdown
	go func() {
		log.Printf("[server] listening on :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[server] listen error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("[server] shutting down...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	srv.Shutdown(ctx)
	kafkaProducer.Close()
	mongoClient.Disconnect(ctx)
	log.Println("[server] bye.")
}
