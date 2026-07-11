package server

import (
	"context"
	"net/http"
	"strings"
	"time"

	"web-porto-backend/internal/config"
	"web-porto-backend/internal/handler"
	"web-porto-backend/internal/middleware"
	"web-porto-backend/pkg/response"
)

type Dependencies struct {
	Config         config.Config
	AuthHandler    *handler.AuthHandler
	ProjectHandler *handler.ProjectHandler
	HealthHandler  *handler.HealthHandler
	ChessHandler   *handler.ChessHandler
}

func NewHTTPServer(deps Dependencies) *http.Server {
	return &http.Server{
		Addr:              ":" + deps.Config.Port,
		Handler:           NewHandler(deps),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
	}
}

func NewHandler(deps Dependencies) http.Handler {
	mux := http.NewServeMux()
	RegisterRoutes(mux, deps)

	limiter := middleware.NewRateLimiter(middleware.RateLimitConfig{
		RPS:     deps.Config.RateLimitRPS,
		Burst:   deps.Config.RateLimitBurst,
		TTL:     deps.Config.RateLimitTTL,
		RetryIn: deps.Config.RateLimitRetryIn,
	})

	return middleware.CORS(deps.Config.AllowedOrigins)(
		limiter.Middleware(
			middleware.Logger(mux),
		),
	)
}

func RegisterRoutes(mux *http.ServeMux, deps Dependencies) {
	mux.HandleFunc("/api/v1/health", allowMethod(http.MethodGet, deps.HealthHandler.Check))
	mux.HandleFunc("/api/v1/auth/login", allowMethod(http.MethodPost, deps.AuthHandler.Login))
	mux.HandleFunc("/api/v1/projects", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			deps.ProjectHandler.GetFeatured(w, r)
		case http.MethodPost:
			middleware.RequireAuth(deps.Config.JWTSecret, deps.ProjectHandler.Create)(w, r)
		default:
			methodNotAllowed(w)
		}
	})
	mux.HandleFunc("/api/v1/projects/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			methodNotAllowed(w)
			return
		}

		id := strings.TrimPrefix(r.URL.Path, "/api/v1/projects/")
		if id == "" || strings.Contains(id, "/") {
			response.Fail(w, http.StatusNotFound, "Project not found", response.CodeNotFound)
			return
		}
		deps.ProjectHandler.GetByID(w, r, id)
	})
	mux.HandleFunc("/ws/chess", allowMethod(http.MethodGet, deps.ChessHandler.HandleChessWS))
}

func Shutdown(ctx context.Context, srv *http.Server) error {
	return srv.Shutdown(ctx)
}

func allowMethod(method string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != method {
			methodNotAllowed(w)
			return
		}
		next(w, r)
	}
}

func methodNotAllowed(w http.ResponseWriter) {
	response.Fail(w, http.StatusMethodNotAllowed, "Method not allowed", response.CodeMethodNotAllowed)
}
