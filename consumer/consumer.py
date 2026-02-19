"""
Distributed Event Aggregator — Python Consumer
Reads raw events from Kafka, performs sentiment analysis, stores in MongoDB,
and forwards enriched events to the processed_events topic.
"""

import json
import logging
import os
import sys
import time
import uuid

from kafka import KafkaConsumer, KafkaProducer
from kafka.errors import NoBrokersAvailable
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from textblob import TextBlob

# ──────────────────────── Config ────────────────────────────

KAFKA_BROKERS = os.getenv("KAFKA_BROKERS", "localhost:9092")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "pipeline")

RAW_TOPIC = "raw_events"
PROCESSED_TOPIC = "processed_events"
DLQ_TOPIC = "dlq_events"

CONSUMER_GROUP = "event-processor-group"

# ──────────────────────── Logging ───────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout,
)
log = logging.getLogger(__name__)

# ──────────────────────── Connections ───────────────────────


def connect_kafka_consumer(retries: int = 30, delay: int = 3) -> KafkaConsumer:
    """Create a Kafka consumer with retry logic."""
    for attempt in range(1, retries + 1):
        try:
            consumer = KafkaConsumer(
                RAW_TOPIC,
                bootstrap_servers=KAFKA_BROKERS.split(","),
                group_id=CONSUMER_GROUP,
                auto_offset_reset="earliest",
                enable_auto_commit=True,
                value_deserializer=lambda m: m,  # raw bytes — we parse manually
                # consumer_timeout_ms=-1, # infinite - removed as it's deprecated or not needed
                max_poll_interval_ms=300000, # 5 minutes
                session_timeout_ms=30000,   # 30 seconds
                heartbeat_interval_ms=10000, # 10 seconds
            )
            log.info("Kafka consumer connected (attempt %d)", attempt)
            return consumer
        except NoBrokersAvailable:
            log.warning("Kafka not ready, retrying %d/%d …", attempt, retries)
            time.sleep(delay)
    log.fatal("Could not connect to Kafka after %d attempts", retries)
    sys.exit(1)


def connect_kafka_producer(retries: int = 30, delay: int = 3) -> KafkaProducer:
    """Create a Kafka producer with retry logic."""
    for attempt in range(1, retries + 1):
        try:
            producer = KafkaProducer(
                bootstrap_servers=KAFKA_BROKERS.split(","),
                value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            )
            log.info("Kafka producer connected (attempt %d)", attempt)
            return producer
        except NoBrokersAvailable:
            log.warning("Kafka producer not ready, retrying %d/%d …", attempt, retries)
            time.sleep(delay)
    log.fatal("Could not create Kafka producer after %d attempts", retries)
    sys.exit(1)


def connect_mongo(retries: int = 15, delay: int = 3) -> MongoClient:
    """Create a MongoDB client with retry logic."""
    for attempt in range(1, retries + 1):
        try:
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            client.admin.command("ping")
            log.info("MongoDB connected (attempt %d)", attempt)
            return client
        except ConnectionFailure:
            log.warning("MongoDB not ready, retrying %d/%d …", attempt, retries)
            time.sleep(delay)
    log.fatal("Could not connect to MongoDB after %d attempts", retries)
    sys.exit(1)


# ──────────────────────── Processing ────────────────────────


def analyse_sentiment(text: str) -> dict:
    """Run TextBlob sentiment analysis and return label + score."""
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity  # –1.0 … +1.0
    if polarity >= 0.1:
        label = "Positive"
    elif polarity <= -0.1:
        label = "Negative"
    else:
        label = "Neutral"
    return {
        "sentiment": label,
        "score": round(polarity, 4),
    }


def process_message(
    raw: bytes,
    collection,
    producer: KafkaProducer,
) -> None:
    """Parse, analyse, store, and forward a single message."""
    _start = time.monotonic()

    # 1. Parse JSON ──────────────────────────────────────────
    try:
        event = json.loads(raw)
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        log.error("Bad JSON → DLQ: %s", exc)
        producer.send(DLQ_TOPIC, {
            "error": "invalid_json",
            "details": str(exc),
            "raw": raw.decode("utf-8", errors="replace"),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        })
        return

    # 2. Validate required fields ────────────────────────────
    payload = event.get("payload", {})
    text = payload.get("text")
    if not text or not isinstance(text, str):
        log.error("Missing payload.text → DLQ")
        producer.send(DLQ_TOPIC, {
            "error": "missing_text",
            "event": event,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        })
        return

    # 3. Sentiment analysis ──────────────────────────────────
    try:
        analysis = analyse_sentiment(text)
    except Exception as exc:
        log.error("Analysis failed → DLQ: %s", exc)
        producer.send(DLQ_TOPIC, {
            "error": "analysis_failed",
            "details": str(exc),
            "event": event,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        })
        return

    # 4. Build MongoDB document ──────────────────────────────
    processing_time_ms = round((time.monotonic() - _start) * 1000, 2)
    analysis["processing_time_ms"] = processing_time_ms
    doc = {
        "_id": event.get("id", str(uuid.uuid4())),
        "source": event.get("source", "unknown"),
        "payload": payload,
        "analysis": analysis,
        "timestamp": event.get("timestamp", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())),
    }

    # 5. Store in MongoDB ────────────────────────────────────
    try:
        collection.insert_one(doc)
        log.info(
            "Stored event %s | sentiment=%s score=%.4f",
            doc["_id"],
            analysis["sentiment"],
            analysis["score"],
        )
    except Exception as exc:
        log.error("MongoDB insert failed: %s", exc)
        return

    # 6. Forward to processed_events ─────────────────────────
    log.info("Forwarding to %s", PROCESSED_TOPIC)
    producer.send(PROCESSED_TOPIC, doc)
    log.info("Forwarded to %s", PROCESSED_TOPIC)


# ──────────────────────── Main Loop ─────────────────────────


def main() -> None:
    log.info("Starting consumer …")
    log.info("Kafka brokers : %s", KAFKA_BROKERS)
    log.info("MongoDB URI   : %s", MONGO_URI)

    consumer = connect_kafka_consumer()
    producer = connect_kafka_producer()
    mongo_client = connect_mongo()
    collection = mongo_client[MONGO_DB]["events"]

    log.info("Listening on topic '%s' …", RAW_TOPIC)

    try:
        for message in consumer:
            process_message(message.value, collection, producer)
    except KeyboardInterrupt:
        log.info("Interrupted — shutting down")
    finally:
        consumer.close()
        producer.flush(timeout=5)
        producer.close()
        mongo_client.close()
        log.info("Consumer stopped.")


if __name__ == "__main__":
    main()
