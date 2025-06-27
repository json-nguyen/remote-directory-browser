package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/goteleport-interview/int-fullstack-jason/api/store"
)

type AuthHandler struct {
	Store store.Store
}

type credentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type loginResponse struct {
	Username string `json:"username"`
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var creds credentials

	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if !h.Store.ValidateCredentials(creds.Username, creds.Password) {
		RespondError(w, http.StatusUnauthorized, "Invalid username or password")
		return
	}

	// Create Session
	sessionToken, err := h.Store.CreateSession(creds.Username)
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to create session")
		return
	}

	// Attach Session to the cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    sessionToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   900,
		Expires:  time.Now().Add(15 * time.Minute),
	})

	respondSuccess(w, loginResponse{Username: creds.Username})
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session")
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "No session token found")
		return
	}

	h.Store.DeleteSession(cookie.Value)

	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
		Expires:  time.Unix(0, 0),
	})
	respondSuccess(w, "Logout successful")

}

func (h *AuthHandler) ValidateSession(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session")
	if err != nil {
		RespondError(w, http.StatusUnauthorized, "No session token found")
		return
	}

	session, ok := h.Store.GetSession(cookie.Value)
	if !ok {
		RespondError(w, http.StatusUnauthorized, "Session expired or invalid")
	}

	respondSuccess(w, loginResponse{Username: session.Username})
}
