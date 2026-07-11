package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"web-porto-backend/internal/config"
	"web-porto-backend/internal/handler"
	"web-porto-backend/internal/repository"
	"web-porto-backend/internal/server"
	"web-porto-backend/internal/usecase"
	"web-porto-backend/pkg/database"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Config error: %v", err)
	}

	dbPool, err := database.NewPostgresDB()
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}
	defer dbPool.Close()

	if err := database.RunMigrations(context.Background(), dbPool); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	userRepo := repository.NewUserRepository(dbPool)
	projectRepo := repository.NewProjectRepository(dbPool)

	authUsecase := usecase.NewAuthUsecase(userRepo, cfg.JWTSecret)
	projectUsecase := usecase.NewProjectUsecase(projectRepo)
	chessUsecase := usecase.NewChessUsecase()

	deps := server.Dependencies{
		Config:         cfg,
		AuthHandler:    handler.NewAuthHandler(authUsecase),
		ProjectHandler: handler.NewProjectHandler(projectUsecase),
		HealthHandler:  handler.NewHealthHandler(cfg.Environment),
		ChessHandler:   handler.NewChessHandler(chessUsecase, cfg.AllowedOrigins),
	}

	srv := server.NewHTTPServer(deps)
	errCh := make(chan error, 1)

	go func() {
		log.Printf("Server starting on port %s", cfg.Port)
		errCh <- srv.ListenAndServe()
	}()

	shutdownCh := make(chan os.Signal, 1)
	signal.Notify(shutdownCh, syscall.SIGINT, syscall.SIGTERM)

	select {
	case err := <-errCh:
		log.Fatalf("Server error: %v", err)
	case sig := <-shutdownCh:
		log.Printf("Received signal %s, shutting down", sig)
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := server.Shutdown(ctx, srv); err != nil {
			log.Fatalf("Graceful shutdown failed: %v", err)
		}
	}
}
