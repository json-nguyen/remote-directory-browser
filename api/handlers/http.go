package handlers

import (
	"encoding/json"
	"net/http"
)

type httpError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type httpResponse struct {
	Data interface{} `json:"data,omitempty"`
}

func respondSuccess(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(httpResponse{Data: data})
}

func RespondError(w http.ResponseWriter, code int, message string) {
	response := httpError{
		Code:    code,
		Message: message,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(response)
}
