package handler

import (
	"net/http"

	"web-porto-backend/pkg/response"
)

type HealthHandler struct {
	environment string
}

func NewHealthHandler(environment string) *HealthHandler {
	return &HealthHandler{environment: environment}
}

func (h *HealthHandler) Check(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.Fail(w, http.StatusMethodNotAllowed, "Method not allowed", response.CodeMethodNotAllowed)
		return
	}

	response.Success(w, http.StatusOK, map[string]any{
		"service":     "web-porto-backend",
		"version":     "v1",
		"environment": h.environment,
	}, "Server is healthy")
}
