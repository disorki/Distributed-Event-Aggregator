# Distributed Event Aggregator (v2.1.0)

[🇺🇸 English](README.md) | [🇷🇺 Русский](README.ru.md)

**Distributed Event Aggregator** is a centralized infrastructural monitoring system designed for high-throughput ingestion, processing, and visualization of distributed event streams. It provides a comprehensive operational picture for system administrators, featuring real-time sentiment analysis and anomaly detection.

![System Status](https://img.shields.io/badge/Status-Operational-success?style=flat-square) ![Version](https://img.shields.io/badge/Version-v2.1.0-blue?style=flat-square) ![License](https://img.shields.io/badge/License-MIT-gray?style=flat-square)

## 🚀 Key Features

### Core Infrastructure
*   **Microservices Architecture**: Decoupled components via Apache Kafka.
*   **High-Performance Ingest**: Go-based producer for low-latency event acceptance.
*   **Intelligent Processing**: Python-based consumer with NLTK sentiment analysis.
*   **Persistent Storage**: MongoDB sharded cluster for data durability.

### Advanced Dashboard (v2.1.0)
*   **Corporate UI/UX**: Clean, "Official Infrastructure" aesthetic using TailwindCSS.
*   **Secure Access**: Simulated RBAC with Login Screen and Session Management.
*   **Interactive Tools**:
    *   **Deep Search**: Real-time filtering of local event buffers.
    *   **System Configuration**: Pause/Resume data feeds and toggle notifications.
    *   **Documentation Hub**: Integrated modal with API specs and architectural diagrams.

## 🛠 Tech Stack

*   **Frontend**: React 18, Vite, TailwindCSS, Recharts, Lucide Icons.
*   **Backend**: Go (Gin), Python (Kafka-Python), Node.js (Express).
*   **Message Broker**: Apache Kafka + Zookeeper.
*   **Database**: MongoDB (v7.0).
*   **Containerization**: Docker & Docker Compose.

## 🏁 Quick Start

### Prerequisites
*   Docker & Docker Compose installed on your machine.

### Installation

1.  **Clone & Launch**
    ```bash
    git clone https://github.com/your-repo/distributed-event-aggregator.git
    cd distributed-event-aggregator
    docker-compose up --build -d
    ```

2.  **Initialization**
    Wait approx. 30 seconds for Kafka topics to be created and services to stabilize.

3.  **Access the Dashboard**
    Navigate to [http://localhost:3100](http://localhost:3100)

    > **Login Credentials:**
    > *   **Username**: `admin`
    > *   **Password**: `password` (or any non-empty string)

## 🕹 Usage Guide

### 1. Generating Traffic
You can simulate incoming events using the included Python script or via cURL.

**Automated Load Test:**
```bash
python test_load.py
```
*This script generates random events with varying sentiment and metadata.*

**Manual Ingest:**
```bash
curl -X POST http://localhost:8090/ingest \
  -H "Content-Type: application/json" \
  -d '{"source":"manual-test", "payload":{"text":"System performance is degrading rapidly.", "meta": "critical"}}'
```

### 2. Dashboard Controls
*   **Search**: Click the magnifying glass icon (or press `/`) to filter events by source or content.
*   **Settings**: Navigate to **Profile -> Settings** to pause the live feed or toggle notifications.
*   **Documentation**: Click the "Documentation" link in the top utility bar for API details.

## 📡 API Reference

### Ingest Event
**POST** `/ingest`
```json
{
  "source": "service-name",
  "payload": {
    "text": "Log message or user feedback",
    "user_id": 12345,
    "meta": "optional-metadata"
  }
}
```

### Event Stream
**GET** `/api/events/stream`
*Server-Sent Events (SSE) endpoint for real-time dashboard updates.*

## 🐛 Troubleshooting

*   **Services not starting?** Check logs: `docker-compose logs -f`
*   **No data in dashboard?** Ensure the "Feed Paused" setting is **OFF** in your profile settings.
