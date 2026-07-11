//go:build integration

package repository_test

import (
	"context"
	"os"
	"testing"
	"time"

	"web-porto-backend/internal/model"
	"web-porto-backend/internal/repository"
	"web-porto-backend/pkg/database"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

func TestProjectRepositoryIntegration(t *testing.T) {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("TEST_DATABASE_URL is required for integration database test")
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		t.Fatalf("connect database: %v", err)
	}
	defer pool.Close()

	if err := database.RunMigrations(ctx, pool); err != nil {
		t.Fatalf("run migrations: %v", err)
	}

	repo := repository.NewProjectRepository(pool)
	id := uuid.New()
	githubURL := "https://github.com/akuaruu/web_porto"
	project := &model.Project{
		ID:          id,
		Title:       "Integration Project",
		Description: "Repository integration test",
		TechStack:   []string{"Go", "PostgreSQL"},
		GithubURL:   &githubURL,
		IsFeatured:  true,
		CreatedAt:   time.Now().UTC(),
		UpdatedAt:   time.Now().UTC(),
	}

	t.Cleanup(func() {
		_, _ = pool.Exec(context.Background(), `DELETE FROM projects WHERE id = $1`, id)
	})

	if err := repo.Create(ctx, project); err != nil {
		t.Fatalf("create project: %v", err)
	}

	found, err := repo.GetByID(ctx, id)
	if err != nil {
		t.Fatalf("get project: %v", err)
	}
	if found.Title != project.Title || found.GithubURL == nil || *found.GithubURL != githubURL {
		t.Fatalf("unexpected project: %+v", found)
	}

	list, err := repo.List(ctx, repository.ProjectFilter{Featured: true, Limit: 50})
	if err != nil {
		t.Fatalf("list projects: %v", err)
	}
	if len(list) == 0 {
		t.Fatal("expected at least one featured project")
	}
}
