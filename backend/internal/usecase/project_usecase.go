package usecase

import (
	"context"
	"errors"
	"net/url"
	"strings"
	"time"
	"web-porto-backend/internal/model"
	"web-porto-backend/internal/repository"

	"github.com/google/uuid"
)

//validation layer of data & logic before dump it on repo

var (
	ErrValidation = errors.New("validation error")
	ErrNotFound   = errors.New("not found")
)

type ProjectFilter struct {
	Featured bool
	Limit    int
}

type CreateProjectInput struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	TechStack   []string `json:"tech_stack"`
	GithubURL   *string  `json:"github_url"`
	LiveURL     *string  `json:"live_url"`
	IsFeatured  bool     `json:"is_featured"`
}

type ProjectUsecase interface {
	List(ctx context.Context, filter ProjectFilter) ([]model.Project, error)
	GetByID(ctx context.Context, id uuid.UUID) (*model.Project, error)
	Store(ctx context.Context, input CreateProjectInput) (*model.Project, error)
}

type projectUsecase struct {
	repo repository.ProjectRepository
}

func NewProjectUsecase(repo repository.ProjectRepository) ProjectUsecase {
	return &projectUsecase{repo}
}

func (u *projectUsecase) List(ctx context.Context, filter ProjectFilter) ([]model.Project, error) {
	if filter.Limit <= 0 {
		filter.Limit = 12
	}
	if filter.Limit > 50 {
		return nil, ErrValidation
	}

	return u.repo.List(ctx, repository.ProjectFilter{
		Featured: filter.Featured,
		Limit:    filter.Limit,
	})
}

func (u *projectUsecase) GetByID(ctx context.Context, id uuid.UUID) (*model.Project, error) {
	project, err := u.repo.GetByID(ctx, id)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, ErrNotFound
	}
	return project, err
}

func (u *projectUsecase) Store(ctx context.Context, input CreateProjectInput) (*model.Project, error) {
	if err := validateProject(input); err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	project := &model.Project{
		ID:          uuid.New(),
		Title:       strings.TrimSpace(input.Title),
		Description: strings.TrimSpace(input.Description),
		TechStack:   trimStack(input.TechStack),
		GithubURL:   cleanOptionalURL(input.GithubURL),
		LiveURL:     cleanOptionalURL(input.LiveURL),
		IsFeatured:  input.IsFeatured,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := u.repo.Create(ctx, project); err != nil {
		return nil, err
	}

	return project, nil
}

func validateProject(input CreateProjectInput) error {
	title := strings.TrimSpace(input.Title)
	description := strings.TrimSpace(input.Description)

	if title == "" || len(title) > 120 {
		return ErrValidation
	}
	if description == "" || len(description) > 1000 {
		return ErrValidation
	}
	if len(input.TechStack) == 0 {
		return ErrValidation
	}
	for _, item := range input.TechStack {
		tech := strings.TrimSpace(item)
		if tech == "" || len(tech) > 40 {
			return ErrValidation
		}
	}
	if !validOptionalURL(input.GithubURL) || !validOptionalURL(input.LiveURL) {
		return ErrValidation
	}

	return nil
}

func trimStack(stack []string) []string {
	clean := make([]string, 0, len(stack))
	for _, item := range stack {
		clean = append(clean, strings.TrimSpace(item))
	}
	return clean
}

func validOptionalURL(value *string) bool {
	clean := cleanOptionalURL(value)
	if clean == nil {
		return true
	}

	parsed, err := url.ParseRequestURI(*clean)
	return err == nil && parsed.Scheme != "" && parsed.Host != ""
}

func cleanOptionalURL(value *string) *string {
	if value == nil {
		return nil
	}
	clean := strings.TrimSpace(*value)
	if clean == "" {
		return nil
	}
	return &clean
}
