package response

import (
	"encoding/json"
	"net/http"
)

type APIResponse struct {
	Status  string `json:"status"`
	Message string `json:"Message"`
	Data    any    `json:"data,omitempty"`
}

func JSON(w http.ResponseWriter, statusCode int, status, message string, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	resp := APIResponse{
		Status:  status,
		Message: message,
		Data:    data,
	}

	json.NewEncoder(w).Encode(resp)
}

func Success(w http.ResponseWriter, statusCode int, data any, message string) {
	JSON(w, statusCode, "success", message, data)
}

func Error(w http.ResponseWriter, statusCode int, message string) {
	JSON(w, statusCode, "error", message, nil)

}
