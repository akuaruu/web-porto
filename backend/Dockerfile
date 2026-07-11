FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main ./cmd/main.go

FROM alpine:latest
WORKDIR /app

# Install Stockfish langsung di container
RUN apk add --no-cache stockfish

COPY --from=builder /app/main .
ENV STOCKFISH_PATH=/usr/bin/stockfish
CMD ["./main"]
