package api

import (
	"crypto/tls"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/http"

	"github.com/goteleport-interview/int-fullstack-jason/api/handlers"
	"github.com/goteleport-interview/int-fullstack-jason/api/middleware"
	"github.com/goteleport-interview/int-fullstack-jason/api/store"
)

// Server serves the directory browser API and webapp.
type Server struct {
	handler http.Handler
}

// NewServer creates a directory browser server.
// It serves webassets from the provided filesystem.
func NewServer(webassets fs.FS) (*Server, error) {
	mux := http.NewServeMux()
	s := &Server{handler: mux}

	authHandler := &handlers.AuthHandler{
		Store: store.NewMemoryStore(),
	}

	// API Routes
	mux.HandleFunc("/api/login", authHandler.Login)
	mux.HandleFunc("/api/logout", authHandler.Logout)
	mux.HandleFunc("/api/validate-session", authHandler.ValidateSession)

	mux.Handle("/api/dir/", middleware.RequireAuth(authHandler.Store)(
		http.HandlerFunc(handlers.GetDirectory),
	))

	// web assets
	hfs := http.FS(webassets)
	files := http.FileServer(hfs)
	mux.Handle("/assets/", files)
	mux.Handle("/favicon.ico", files)

	// fall back to index.html for all unknown routes
	index, err := extractIndexHTML(hfs)
	if err != nil {
		return nil, err
	}
	mux.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if _, err := w.Write(index); err != nil {
			log.Println("failed to serve index.html", err)
		}
	}))

	return s, nil
}

func (s *Server) ListenAndServe(addr string) error {
	server := &http.Server{
		Addr:    addr,
		Handler: s.handler,
		TLSConfig: &tls.Config{
			MinVersion: tls.VersionTLS13,
		},
	}

	return server.ListenAndServeTLS("certs/cert.pem", "certs/key.pem")
}

func extractIndexHTML(fs http.FileSystem) ([]byte, error) {
	f, err := fs.Open("index.html")
	if err != nil {
		return nil, fmt.Errorf("could not open index.html: %w", err)
	}
	defer f.Close()

	b, err := io.ReadAll(f)
	if err != nil {
		return nil, fmt.Errorf("could not read index.html: %w", err)
	}

	return b, nil
}
