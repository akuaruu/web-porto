package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"web-porto-backend/internal/usecase"
	"web-porto-backend/pkg/response"

	"github.com/google/uuid"
)

type ProjectHandler struct {
	usecase usecase.ProjectUsecase
}

func NewProjectHandler(u usecase.ProjectUsecase) *ProjectHandler {
	return &ProjectHandler{usecase: u}
}

func (h *ProjectHandler) GetFeatured(w http.ResponseWriter, r *http.Request) {
	featured := true
	if raw := r.URL.Query().Get("featured"); raw != "" {
		parsed, err := strconv.ParseBool(raw)
		if err != nil {
			response.Fail(w, http.StatusBadRequest, "Project query validation failed", response.CodeValidationError)
			return
		}
		featured = parsed
	}

	limit := 12
	if raw := r.URL.Query().Get("limit"); raw != "" {
		parsed, err := strconv.Atoi(raw)
		if err != nil || parsed < 1 || parsed > 50 {
			response.Fail(w, http.StatusBadRequest, "Project query validation failed", response.CodeValidationError)
			return
		}
		limit = parsed
	}

	projects, err := h.usecase.List(r.Context(), usecase.ProjectFilter{
		Featured: featured,
		Limit:    limit,
	})
	if err != nil {
		if errors.Is(err, usecase.ErrValidation) {
			response.Fail(w, http.StatusBadRequest, "Project query validation failed", response.CodeValidationError)
			return
		}
		response.Fail(w, http.StatusInternalServerError, "Internal server error", response.CodeInternalError)
		return
	}

	response.Success(w, http.StatusOK, projects, "Projects retrieved")
}

func (h *ProjectHandler) GetByID(w http.ResponseWriter, r *http.Request, id string) {
	projectID, err := uuid.Parse(strings.TrimSpace(id))
	if err != nil {
		response.Fail(w, http.StatusBadRequest, "Invalid project id", response.CodeValidationError)
		return
	}

	project, err := h.usecase.GetByID(r.Context(), projectID)
	if err != nil {
		if errors.Is(err, usecase.ErrNotFound) {
			response.Fail(w, http.StatusNotFound, "Project not found", response.CodeNotFound)
			return
		}
		response.Fail(w, http.StatusInternalServerError, "Internal server error", response.CodeInternalError)
		return
	}

	response.Success(w, http.StatusOK, project, "Project retrieved")
}

func (h *ProjectHandler) Create(w http.ResponseWriter, r *http.Request) {
	if !strings.HasPrefix(r.Header.Get("Content-Type"), "application/json") {
		response.Fail(w, http.StatusUnsupportedMediaType, "Content-Type must be application/json", response.CodeUnsupportedMedia)
		return
	}

	var input usecase.CreateProjectInput
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&input); err != nil {
		response.Fail(w, http.StatusBadRequest, "Invalid request body", response.CodeInvalidRequestBody)
		return
	}

	project, err := h.usecase.Store(r.Context(), input)
	if err != nil {
		if errors.Is(err, usecase.ErrValidation) {
			response.Fail(w, http.StatusBadRequest, "Project validation failed", response.CodeValidationError)
			return
		}
		response.Fail(w, http.StatusInternalServerError, "Internal server error", response.CodeInternalError)
		return
	}

	response.Success(w, http.StatusCreated, project, "Project created")
}
