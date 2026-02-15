FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

RUN apt-get update && \
    apt-get install -y --no-install-recommends libsnappy-dev gcc g++ && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir -r requirements.txt && \
    python -m textblob.download_corpora

COPY . .

CMD ["python", "-u", "consumer.py"]
