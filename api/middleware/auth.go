package middleware

import (
	"net/http"
	"strings"

	"github.com/goteleport-interview/int-fullstack-jason/api/handlers"
	"github.com/goteleport-interview/int-fullstack-jason/api/store"
)

func RequireAuth(store store.Store) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie("session")
			if err != nil || strings.TrimSpace(cookie.Value) == "" {
				handlers.RespondError(w, http.StatusUnauthorized, "Session expired or invalid")
				return
			}

			_, ok := store.GetSession(cookie.Value)
			if !ok {
				handlers.RespondError(w, http.StatusUnauthorized, "Session expired or invalid")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
