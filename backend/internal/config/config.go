package config

import (
	"errors"
	"os"
	"strconv"
	"strings"
	"time"

	"golang.org/x/time/rate"
)

type Config struct {
	Port              string
	Environment       string
	JWTSecret         string
	AllowedOrigins    []string
	RateLimitRPS      rate.Limit
	RateLimitBurst    int
	RateLimitTTL      time.Duration
	RateLimitRetryIn  time.Duration
	TrustedProxyAddrs bool
}

func Load() (Config, error) {
	cfg := Config{
		Port:             envOr("PORT", "8080"),
		Environment:      envOr("APP_ENV", "development"),
		JWTSecret:        os.Getenv("JWT_SECRET"),
		AllowedOrigins:   splitOrigins(envOr("ALLOWED_ORIGINS", "https://aruu.app,https://www.aruu.app,http://localhost:3000")),
		RateLimitRPS:     rate.Limit(floatEnv("RATE_LIMIT_RPS", 5)),
		RateLimitBurst:   intEnv("RATE_LIMIT_BURST", 10),
		RateLimitTTL:     time.Duration(intEnv("RATE_LIMIT_TTL_SECONDS", 300)) * time.Second,
		RateLimitRetryIn: time.Duration(intEnv("RATE_LIMIT_RETRY_SECONDS", 10)) * time.Second,
	}

	if cfg.JWTSecret == "" {
		return Config{}, errors.New("JWT_SECRET is required")
	}

	return cfg, nil
}

func envOr(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

func intEnv(key string, fallback int) int {
	value, err := strconv.Atoi(strings.TrimSpace(os.Getenv(key)))
	if err != nil || value <= 0 {
		return fallback
	}
	return value
}

func floatEnv(key string, fallback float64) float64 {
	value, err := strconv.ParseFloat(strings.TrimSpace(os.Getenv(key)), 64)
	if err != nil || value <= 0 {
		return fallback
	}
	return value
}

func splitOrigins(value string) []string {
	parts := strings.Split(value, ",")
	origins := make([]string, 0, len(parts))
	for _, part := range parts {
		origin := strings.TrimSpace(part)
		if origin != "" {
			origins = append(origins, origin)
		}
	}
	return origins
}
