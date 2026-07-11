package response

import (
	"encoding/json"
	"net/http"
)

type APIResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
	Error   *Error `json:"error,omitempty"`
}

type Error struct {
	Code string `json:"code"`
}

const (
	CodeInvalidRequestBody = "INVALID_REQUEST_BODY"
	CodeValidationError    = "VALIDATION_ERROR"
	CodeUnauthorized       = "UNAUTHORIZED"
	CodeForbidden          = "FORBIDDEN"
	CodeNotFound           = "NOT_FOUND"
	CodeMethodNotAllowed   = "METHOD_NOT_ALLOWED"
	CodeUnsupportedMedia   = "UNSUPPORTED_MEDIA_TYPE"
	CodeRateLimited        = "RATE_LIMITED"
	CodeInternalError      = "INTERNAL_ERROR"
	CodeServiceUnavailable = "SERVICE_UNAVAILABLE"
)

func JSON(w http.ResponseWriter, statusCode int, status, message string, data any, apiError *Error) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	resp := APIResponse{
		Status:  status,
		Message: message,
		Data:    data,
		Error:   apiError,
	}

	json.NewEncoder(w).Encode(resp)
}

func Success(w http.ResponseWriter, statusCode int, data any, message string) {
	JSON(w, statusCode, "success", message, data, nil)
}

func Fail(w http.ResponseWriter, statusCode int, message, code string) {
	JSON(w, statusCode, "error", message, nil, &Error{Code: code})
}
