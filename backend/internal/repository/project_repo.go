package repository

import (
	"context"
	"errors"
	"log"
	"web-porto-backend/internal/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNotFound = errors.New("not found")

type ProjectFilter struct {
	Featured bool
	Limit    int
}

type ProjectRepository interface {
	List(ctx context.Context, filter ProjectFilter) ([]model.Project, error)
	GetByID(ctx context.Context, id uuid.UUID) (*model.Project, error)
	Create(ctx context.Context, project *model.Project) error
}

type projectRepository struct {
	db *pgxpool.Pool
}

func NewProjectRepository(db *pgxpool.Pool) ProjectRepository {
	return &projectRepository{db}
}

func (r *projectRepository) List(ctx context.Context, filter ProjectFilter) ([]model.Project, error) {
	if filter.Limit <= 0 {
		filter.Limit = 12
	}

	query := `SELECT id, title, description, tech_stack, github_url, live_url, is_featured, created_at, updated_at
	          FROM projects
	          WHERE ($1::boolean = false OR is_featured = true)
	          ORDER BY created_at DESC
	          LIMIT $2`

	rows, err := r.db.Query(ctx, query, filter.Featured, filter.Limit)
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

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return projects, nil
}

func (r *projectRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.Project, error) {
	query := `SELECT id, title, description, tech_stack, github_url, live_url, is_featured, created_at, updated_at
	          FROM projects WHERE id = $1`

	var p model.Project
	err := r.db.QueryRow(ctx, query, id).Scan(
		&p.ID, &p.Title, &p.Description, &p.TechStack,
		&p.GithubURL, &p.LiveURL, &p.IsFeatured, &p.CreatedAt, &p.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	return &p, nil
}

func (r *projectRepository) Create(ctx context.Context, p *model.Project) error {
	query := `INSERT INTO projects (id, title, description, tech_stack, github_url, live_url, is_featured, created_at, updated_at) 
	          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`

	_, err := r.db.Exec(ctx, query, p.ID, p.Title, p.Description, p.TechStack, p.GithubURL, p.LiveURL, p.IsFeatured, p.CreatedAt, p.UpdatedAt)
	return err
}
