FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/main.go

FROM debian:bookworm-slim
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/main .
COPY bin/stockfish ./bin/stockfish
RUN chmod +x ./bin/stockfish

ENV STOCKFISH_PATH=/app/bin/stockfish
CMD ["./main"]
