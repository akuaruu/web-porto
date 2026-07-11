package server_test

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"web-porto-backend/internal/config"
	"web-porto-backend/internal/handler"
	"web-porto-backend/internal/model"
	"web-porto-backend/internal/server"
	"web-porto-backend/internal/usecase"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/time/rate"
)

type fakeAuthUsecase struct{}

func (fakeAuthUsecase) Login(ctx context.Context, username, password string) (string, time.Time, error) {
	if username == "" || password == "" {
		return "", time.Time{}, usecase.ErrValidation
	}
	return "signed-token", time.Date(2026, 7, 11, 15, 30, 0, 0, time.UTC), nil
}

type fakeProjectUsecase struct {
	project    model.Project
	listFilter usecase.ProjectFilter
}

func (u *fakeProjectUsecase) List(ctx context.Context, filter usecase.ProjectFilter) ([]model.Project, error) {
	u.listFilter = filter
	return []model.Project{u.project}, nil
}

func (u *fakeProjectUsecase) GetByID(ctx context.Context, id uuid.UUID) (*model.Project, error) {
	if id != u.project.ID {
		return nil, usecase.ErrNotFound
	}
	return &u.project, nil
}

func (u *fakeProjectUsecase) Store(ctx context.Context, input usecase.CreateProjectInput) (*model.Project, error) {
	if input.Title == "" {
		return nil, usecase.ErrValidation
	}
	project := u.project
	project.Title = input.Title
	return &project, nil
}

type fakeChessUsecase struct{}

func (fakeChessUsecase) StartEngine(ctx context.Context) (*usecase.EngineSession, error) {
	return nil, errors.New("not used")
}

func TestHTTPHandlerRoutesUseAPIContract(t *testing.T) {
	projectID := uuid.New()
	githubURL := "https://github.com/akuaruu/web_porto"
	projects := &fakeProjectUsecase{
		project: model.Project{
			ID:          projectID,
			Title:       "Portfolio API",
			Description: "Go backend portfolio API",
			TechStack:   []string{"Go", "PostgreSQL"},
			GithubURL:   &githubURL,
			IsFeatured:  true,
			CreatedAt:   time.Date(2026, 7, 10, 15, 30, 0, 0, time.UTC),
			UpdatedAt:   time.Date(2026, 7, 10, 15, 30, 0, 0, time.UTC),
		},
	}

	app := newTestApp(projects)

	t.Run("health", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/health", nil)
		req.Header.Set("Origin", "https://aruu.app")
		rec := httptest.NewRecorder()

		app.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
		if rec.Header().Get("Access-Control-Allow-Origin") != "https://aruu.app" {
			t.Fatalf("expected allowed origin, got %q", rec.Header().Get("Access-Control-Allow-Origin"))
		}
		assertJSONField(t, rec.Body.Bytes(), "message", "Server is healthy")
	})

	t.Run("list projects query", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/projects?featured=false&limit=2", nil)
		rec := httptest.NewRecorder()

		app.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
		if projects.listFilter.Featured || projects.listFilter.Limit != 2 {
			t.Fatalf("unexpected filter: %+v", projects.listFilter)
		}
		assertJSONField(t, rec.Body.Bytes(), "message", "Projects retrieved")
	})

	t.Run("get project by id", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/projects/"+projectID.String(), nil)
		rec := httptest.NewRecorder()

		app.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
		assertJSONField(t, rec.Body.Bytes(), "message", "Project retrieved")
	})

	t.Run("protected create rejects missing token", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/projects", bytes.NewBufferString(`{"title":"API","description":"desc","tech_stack":["Go"]}`))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		app.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d", rec.Code)
		}
		assertJSONErrorCode(t, rec.Body.Bytes(), "UNAUTHORIZED")
	})

	t.Run("protected create accepts valid bearer token", func(t *testing.T) {
		token := signTestToken(t, "test-secret")
		req := httptest.NewRequest(http.MethodPost, "/api/v1/projects", bytes.NewBufferString(`{"title":"API","description":"desc","tech_stack":["Go"]}`))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)
		rec := httptest.NewRecorder()

		app.ServeHTTP(rec, req)

		if rec.Code != http.StatusCreated {
			t.Fatalf("expected 201, got %d: %s", rec.Code, rec.Body.String())
		}
		assertJSONField(t, rec.Body.Bytes(), "message", "Project created")
	})

	t.Run("method not allowed is json", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPut, "/api/v1/health", nil)
		rec := httptest.NewRecorder()

		app.ServeHTTP(rec, req)

		if rec.Code != http.StatusMethodNotAllowed {
			t.Fatalf("expected 405, got %d", rec.Code)
		}
		assertJSONErrorCode(t, rec.Body.Bytes(), "METHOD_NOT_ALLOWED")
	})
}

func newTestApp(projects *fakeProjectUsecase) http.Handler {
	cfg := config.Config{
		Port:             "8080",
		Environment:      "test",
		JWTSecret:        "test-secret",
		AllowedOrigins:   []string{"https://aruu.app", "http://localhost:3000"},
		RateLimitRPS:     rate.Limit(1000),
		RateLimitBurst:   1000,
		RateLimitTTL:     time.Minute,
		RateLimitRetryIn: time.Second,
	}

	return server.NewHandler(server.Dependencies{
		Config:         cfg,
		AuthHandler:    handler.NewAuthHandler(fakeAuthUsecase{}),
		ProjectHandler: handler.NewProjectHandler(projects),
		HealthHandler:  handler.NewHealthHandler(cfg.Environment),
		ChessHandler:   handler.NewChessHandler(fakeChessUsecase{}, cfg.AllowedOrigins),
	})
}

func signTestToken(t *testing.T, secret string) string {
	t.Helper()

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": "test",
		"exp": time.Now().Add(time.Hour).Unix(),
	})
	signed, err := token.SignedString([]byte(secret))
	if err != nil {
		t.Fatalf("sign token: %v", err)
	}
	return signed
}

func assertJSONField(t *testing.T, body []byte, field, want string) {
	t.Helper()

	var decoded map[string]any
	if err := json.Unmarshal(body, &decoded); err != nil {
		t.Fatalf("decode json: %v", err)
	}
	if got, _ := decoded[field].(string); got != want {
		t.Fatalf("expected %s=%q, got %q in %s", field, want, got, string(body))
	}
}

func assertJSONErrorCode(t *testing.T, body []byte, want string) {
	t.Helper()

	var decoded struct {
		Error struct {
			Code string `json:"code"`
		} `json:"error"`
	}
	if err := json.Unmarshal(body, &decoded); err != nil {
		t.Fatalf("decode json: %v", err)
	}
	if decoded.Error.Code != want {
		t.Fatalf("expected error code %q, got %q in %s", want, decoded.Error.Code, string(body))
	}
}
