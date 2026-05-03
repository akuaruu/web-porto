# Stage 1: Build the Go binary
FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main ./cmd/main.go

# Stage 2: Create a minimal production image
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/main .
COPY .env . 
EXPOSE 8080
CMD ["./main"]