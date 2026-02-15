import requests
import time
import random
import json

# Configuration
URL = "http://localhost:8090/ingest"
HEADERS = {"Content-Type": "application/json"}

# Test Data
SOURCES = ["twitter", "news_api", "user_feedback", "reddit", "internal_logs"]
MESSAGES = [
    "The system is running smoothly and performance is great.",
    "I am facing issues with the login page, it's very slow.",
    "The new feature is amazing! I love the design.",
    "Error 500 when trying to submit the form.",
    "Customer support was very helpful and resolved my issue quickly.",
    "This is the worst experience I've ever had with this product.",
    "Latency is high in the us-east-1 region.",
    "Deployment successful, all systems go.",
    "I'm not sure how to use this feature, the documentation is unclear.",
    "Absolutely fantastic work on the recent update!"
]

def generate_event():
    return {
        "source": random.choice(SOURCES),
        "payload": {
            "text": random.choice(MESSAGES),
            "user_id": random.randint(1000, 9999),
            "meta": "trace_" + str(random.randint(100, 999))
        }
    }

def main():
    print(f"🚀 Starting event generator targeting {URL}...")
    print("Press Ctrl+C to stop.")
    
    count = 0
    try:
        while True:
            event = generate_event()
            try:
                response = requests.post(URL, headers=HEADERS, data=json.dumps(event))
                if response.status_code == 202:
                    print(f"[{count+1}] ✅ Sent: {event['payload']['text'][:50]}...")
                else:
                    print(f"[{count+1}] ❌ Failed: {response.status_code} - {response.text}")
            except requests.exceptions.RequestException as e:
                print(f"[{count+1}] ❌ Connection Error: {e}")
            
            count += 1
            time.sleep(random.uniform(0.5, 2.0)) # Random delay between 0.5s and 2s

    except KeyboardInterrupt:
        print("\n🛑 Stopped event generator.")

if __name__ == "__main__":
    main()
