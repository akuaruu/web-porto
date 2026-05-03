package handler

import (
	"encoding/json"
	"net/http"
	"web-porto-backend/internal/model"
	"web-porto-backend/internal/usecase"
	"web-porto-backend/pkg/response"
)

type ProjectHandler struct {
	usecase usecase.ProjectUsecase
}

func NewProjectHandler(u usecase.ProjectUsecase) *ProjectHandler {
	return &ProjectHandler{usecase: u}
}

func (h *ProjectHandler) GetFeatured(w http.ResponseWriter, r *http.Request) {
	projects, err := h.usecase.FetchFeatured(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to fetch projects")
		return
	}

	response.Success(w, http.StatusOK, projects, "Featured projects retrieved")
}

func (h *ProjectHandler) Create(w http.ResponseWriter, r *http.Request) {
	var p model.Project
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		response.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.usecase.Store(r.Context(), &p); err != nil {
		response.Error(w, http.StatusInternalServerError, "Failed to create project")
		return
	}

	response.Success(w, http.StatusCreated, p, "Project created successfully")
}
