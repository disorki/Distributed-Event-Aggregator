# ---- Build Stage ----
FROM golang:1.22-alpine AS builder
RUN apk add --no-cache git
WORKDIR /app
# Copy everything so 'go mod tidy' sees the actual code imports
COPY . .
# Now download deps and generate go.sum
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -o /producer .

# ---- Runtime Stage ----
FROM alpine:3.19
RUN apk add --no-cache ca-certificates
COPY --from=builder /producer /producer
EXPOSE 8090
CMD ["/producer"]
