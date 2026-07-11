package usecase

import (
	"context"
	"errors"
	"testing"
	"time"

	"web-porto-backend/internal/model"
	"web-porto-backend/internal/repository"

	"github.com/google/uuid"
)

type fakeProjectRepo struct {
	listFilter repository.ProjectFilter
	created    *model.Project
	project    *model.Project
	err        error
}

func (r *fakeProjectRepo) List(ctx context.Context, filter repository.ProjectFilter) ([]model.Project, error) {
	r.listFilter = filter
	return nil, r.err
}

func (r *fakeProjectRepo) GetByID(ctx context.Context, id uuid.UUID) (*model.Project, error) {
	if r.err != nil {
		return nil, r.err
	}
	return r.project, nil
}

func (r *fakeProjectRepo) Create(ctx context.Context, project *model.Project) error {
	if r.err != nil {
		return r.err
	}
	r.created = project
	return nil
}

func TestProjectUsecaseStoreCreatesValidatedProject(t *testing.T) {
	repo := &fakeProjectRepo{}
	uc := NewProjectUsecase(repo)
	githubURL := " https://github.com/akuaruu/web_porto "

	project, err := uc.Store(context.Background(), CreateProjectInput{
		Title:       " Portfolio API ",
		Description: " Go backend with PostgreSQL ",
		TechStack:   []string{" Go ", "PostgreSQL"},
		GithubURL:   &githubURL,
		IsFeatured:  true,
	})

	if err != nil {
		t.Fatalf("Store returned error: %v", err)
	}
	if repo.created == nil {
		t.Fatal("expected repository Create to be called")
	}
	if project.ID == uuid.Nil {
		t.Fatal("expected generated UUID")
	}
	if project.Title != "Portfolio API" {
		t.Fatalf("expected trimmed title, got %q", project.Title)
	}
	if project.TechStack[0] != "Go" {
		t.Fatalf("expected trimmed tech stack, got %q", project.TechStack[0])
	}
	if project.GithubURL == nil || *project.GithubURL != "https://github.com/akuaruu/web_porto" {
		t.Fatalf("expected cleaned github URL, got %v", project.GithubURL)
	}
	if project.CreatedAt.IsZero() || project.UpdatedAt.IsZero() {
		t.Fatal("expected timestamps")
	}
	if project.CreatedAt.Location() != time.UTC {
		t.Fatalf("expected UTC timestamp, got %s", project.CreatedAt.Location())
	}
}

func TestProjectUsecaseStoreRejectsInvalidInput(t *testing.T) {
	repo := &fakeProjectRepo{}
	uc := NewProjectUsecase(repo)
	badURL := "not-a-url"

	tests := []CreateProjectInput{
		{Description: "missing title", TechStack: []string{"Go"}},
		{Title: "missing description", TechStack: []string{"Go"}},
		{Title: "missing stack", Description: "desc"},
		{Title: "bad url", Description: "desc", TechStack: []string{"Go"}, GithubURL: &badURL},
	}

	for _, input := range tests {
		_, err := uc.Store(context.Background(), input)
		if !errors.Is(err, ErrValidation) {
			t.Fatalf("expected ErrValidation, got %v", err)
		}
	}
	if repo.created != nil {
		t.Fatal("repository should not be called for invalid input")
	}
}

func TestProjectUsecaseListAppliesLimitRules(t *testing.T) {
	repo := &fakeProjectRepo{}
	uc := NewProjectUsecase(repo)

	if _, err := uc.List(context.Background(), ProjectFilter{Featured: true}); err != nil {
		t.Fatalf("List returned error: %v", err)
	}
	if repo.listFilter.Limit != 12 {
		t.Fatalf("expected default limit 12, got %d", repo.listFilter.Limit)
	}

	if _, err := uc.List(context.Background(), ProjectFilter{Limit: 51}); !errors.Is(err, ErrValidation) {
		t.Fatalf("expected ErrValidation for limit > 50, got %v", err)
	}
}

func TestProjectUsecaseMapsRepositoryNotFound(t *testing.T) {
	repo := &fakeProjectRepo{err: repository.ErrNotFound}
	uc := NewProjectUsecase(repo)

	_, err := uc.GetByID(context.Background(), uuid.New())
	if !errors.Is(err, ErrNotFound) {
		t.Fatalf("expected ErrNotFound, got %v", err)
	}
}
