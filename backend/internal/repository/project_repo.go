package repository

import (
	"context"
	"log"
	"web-porto-backend/internal/model"

	"github.com/jackc/pgx/v5/pgxpool"
)

type ProjectRepository interface {
	GetFeatured(ctx context.Context) ([]model.Project, error)
	Create(ctx context.Context, project *model.Project) error
}

type projectRepository struct {
	db *pgxpool.Pool
}

func NewProjectRepository(db *pgxpool.Pool) ProjectRepository {
	return &projectRepository{db}
}

func (r *projectRepository) GetFeatured(ctx context.Context) ([]model.Project, error) {
	query := `SELECT id, title, description, tech_stack, github_url, live_url, is_featured, created_at, updated_at 
	          FROM projects WHERE is_featured = true ORDER BY created_at DESC`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		log.Println("Error captured from DB:", err)
		return nil, err
	}
	defer rows.Close()

	var projects []model.Project
	for rows.Next() {
		var p model.Project
		err := rows.Scan(&p.ID, &p.Title, &p.Description, &p.TechStack,
			&p.GithubURL, &p.LiveURL, &p.IsFeatured, &p.CreatedAt, &p.UpdatedAt)

		if err != nil {
			return nil, err
		}
		projects = append(projects, p)
	}

	return projects, nil
}

func (r *projectRepository) Create(ctx context.Context, p *model.Project) error {
	query := `INSERT INTO projects (id, title, description, tech_stack, github_url, live_url, is_featured, created_at, updated_at) 
	          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`

	_, err := r.db.Exec(ctx, query, p.ID, p.Title, p.Description, p.TechStack, p.GithubURL, p.LiveURL, p.IsFeatured, p.CreatedAt, p.UpdatedAt)
	return err
}
