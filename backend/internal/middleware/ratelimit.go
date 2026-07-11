package middleware

import (
	"net"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"
	"web-porto-backend/pkg/response"

	"golang.org/x/time/rate"
)

type RateLimitConfig struct {
	RPS     rate.Limit
	Burst   int
	TTL     time.Duration
	RetryIn time.Duration
	Now     func() time.Time
}

type visitor struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

type IPRateLimiter struct {
	mu       sync.Mutex
	visitors map[string]visitor
	cfg      RateLimitConfig
}

func NewRateLimiter(cfg RateLimitConfig) *IPRateLimiter {
	if cfg.RPS <= 0 {
		cfg.RPS = 5
	}
	if cfg.Burst <= 0 {
		cfg.Burst = 10
	}
	if cfg.TTL <= 0 {
		cfg.TTL = 5 * time.Minute
	}
	if cfg.RetryIn <= 0 {
		cfg.RetryIn = 10 * time.Second
	}
	if cfg.Now == nil {
		cfg.Now = time.Now
	}

	return &IPRateLimiter{
		visitors: make(map[string]visitor),
		cfg:      cfg,
	}
}

func (rl *IPRateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		limiter := rl.limiterFor(clientIP(r))

		if !limiter.Allow() {
			retrySeconds := int(rl.cfg.RetryIn.Seconds())
			w.Header().Set("Retry-After", strconv.Itoa(retrySeconds))
			response.Fail(w, http.StatusTooManyRequests, "Too many requests. Please retry later.", response.CodeRateLimited)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func RateLimiter(next http.Handler) http.Handler {
	return NewRateLimiter(RateLimitConfig{}).Middleware(next)
}

func (rl *IPRateLimiter) limiterFor(ip string) *rate.Limiter {
	now := rl.cfg.Now()

	rl.mu.Lock()
	defer rl.mu.Unlock()

	for key, item := range rl.visitors {
		if now.Sub(item.lastSeen) > rl.cfg.TTL {
			delete(rl.visitors, key)
		}
	}

	item, exists := rl.visitors[ip]
	if !exists {
		item = visitor{limiter: rate.NewLimiter(rl.cfg.RPS, rl.cfg.Burst)}
	}
	item.lastSeen = now
	rl.visitors[ip] = item

	return item.limiter
}

func clientIP(r *http.Request) string {
	if ip := strings.TrimSpace(r.Header.Get("CF-Connecting-IP")); ip != "" {
		return ip
	}
	if forwarded := strings.TrimSpace(r.Header.Get("X-Forwarded-For")); forwarded != "" {
		parts := strings.Split(forwarded, ",")
		if ip := strings.TrimSpace(parts[0]); ip != "" {
			return ip
		}
	}
	if ip := strings.TrimSpace(r.Header.Get("X-Real-IP")); ip != "" {
		return ip
	}
	if ip, _, err := net.SplitHostPort(r.RemoteAddr); err == nil {
		return ip
	}
	return r.RemoteAddr
}
