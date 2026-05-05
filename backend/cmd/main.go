package main

import (
	"log"
	"net/http"
	"os"

	"web-porto-backend/internal/handler"
	"web-porto-backend/internal/middleware"
	"web-porto-backend/internal/repository"
	"web-porto-backend/internal/usecase"
	"web-porto-backend/pkg/database"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading from environment variables")
	}

	dbPool, err := database.NewPostgresDB()
	if err != nil {
		log.Fatalf("Database connection failed: %v\n", err)
	}
	defer dbPool.Close()

	// 1. Layer Initialization (Dependency Injection)
	userRepo := repository.NewUserRepository(dbPool)
	authUsecase := usecase.NewAuthUsecase(userRepo)
	authHandler := handler.NewAuthHandler(authUsecase)

	projectRepo := repository.NewProjectRepository(dbPool)
	projectUsecase := usecase.NewProjectUsecase(projectRepo)
	projectHandler := handler.NewProjectHandler(projectUsecase)

	// 2. Setup Router
	healthHandler := handler.NewHealthHandler()

	mux := http.NewServeMux()

	// Auth endpoints
	mux.HandleFunc("/api/v1/auth/login", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			authHandler.Login(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Project endpoints
	mux.HandleFunc("/api/v1/projects", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			projectHandler.GetFeatured(w, r)
		case http.MethodPost:
			middleware.RequireAuth(projectHandler.Create)(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Health enpoint
	mux.HandleFunc("/api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		healthHandler.Check(w, r)
	})

	// Protection layer
	handler := middleware.CORS(middleware.RateLimiter(middleware.Logger(mux)))

	// 3. Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s\n", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Server error: %v\n", err)
	}
}
