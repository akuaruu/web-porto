package usecase

import (
	"context"
	"time"
	"web-porto-backend/internal/model"
	"web-porto-backend/internal/repository"

	"github.com/google/uuid"
)

//validation layer of data & logic before dump it on repo

type ProjectUsecase interface {
	FetchFeatured(ctx context.Context) ([]model.Project, error)
	Store(ctx context.Context, p *model.Project) error
}

type projectUsecase struct {
	repo repository.ProjectRepository
}

func NewProjectUsecase(repo repository.ProjectRepository) ProjectUsecase {
	return &projectUsecase{repo}
}

func (u *projectUsecase) FetchFeatured(ctx context.Context) ([]model.Project, error) {
	return u.repo.GetFeatured(ctx)
}

func (u *projectUsecase) Store(ctx context.Context, p *model.Project) error {
	p.ID = uuid.New()
	p.CreatedAt = time.Now()
	p.UpdatedAt = time.Now()

	return u.repo.Create(ctx, p)
}
