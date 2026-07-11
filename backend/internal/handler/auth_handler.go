package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"web-porto-backend/internal/usecase"
	"web-porto-backend/pkg/response"
)

type AuthHandler struct {
	usecase usecase.AuthUsecase
}

func NewAuthHandler(u usecase.AuthUsecase) *AuthHandler {
	return &AuthHandler{usecase: u}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Fail(w, http.StatusBadRequest, "Invalid request body", response.CodeInvalidRequestBody)
		return
	}

	token, expiresAt, err := h.usecase.Login(r.Context(), req.Username, req.Password)
	if err != nil {
		if errors.Is(err, usecase.ErrValidation) {
			response.Fail(w, http.StatusBadRequest, "Username and password are required", response.CodeValidationError)
			return
		}
		response.Fail(w, http.StatusUnauthorized, "Invalid credentials", response.CodeUnauthorized)
		return
	}

	response.Success(w, http.StatusOK, map[string]any{
		"token":      token,
		"expires_at": expiresAt,
	}, "Login successful")
}
