package handlers

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

const baseDir = "./mockDirectory"

type file struct {
	Name string `json:"name"`
	Type string `json:"type"`
	Size int64  `json:"size"`
}

type directoryResponse struct {
	Name     string `json:"name"`
	Type     string `json:"type"`
	Size     int64  `json:"size"`
	Contents []file `json:"contents"`
}

func GetDirectory(w http.ResponseWriter, r *http.Request) {
	reqPath := strings.TrimPrefix(r.URL.Path, "/api/dir")
	reqPath = filepath.FromSlash(reqPath)
	reqPath = filepath.Clean(reqPath)

	cleanedBaseDir, err := filepath.Abs(baseDir)
	if err != nil {
		RespondError(w, http.StatusNotFound, "Requested directory could not be found")
		return
	}

	cleanedBaseDir = filepath.Clean(cleanedBaseDir)
	joinedPath := filepath.Join(cleanedBaseDir, reqPath)

	resolvedPath, err := filepath.EvalSymlinks(joinedPath)
	if err != nil {
		// If symlink resolution fails, it often means the path doesn't exist
		// or isn't accessible, which should be treated as a 404 or permission error.
		RespondError(w, http.StatusNotFound, "Requested directory could not be found")
		return
	}

	resolvedPath = filepath.Clean(resolvedPath)

	rel, err := filepath.Rel(cleanedBaseDir, resolvedPath)
	if err != nil || strings.HasPrefix(rel, "..") {
		RespondError(w, http.StatusNotFound, "Requested directory could not be found")
		return
	}

	// We could spread the errors checks into different checks, like if they have permissions to read,
	// but since we aren't logging anything and for the scope of this project we will be returning a 404
	// for every error
	directory, err := os.ReadDir(resolvedPath)
	if err != nil {
		RespondError(w, http.StatusNotFound, "Requested directory could not be found")
		return
	}

	resp := directoryResponse{
		Name: filepath.Base(resolvedPath),
		Type: "dir",
	}

	for _, entry := range directory {
		info, err := entry.Info()
		if err != nil {
			RespondError(w, http.StatusNotFound, "Requested directory could not be found")
			return
		}
		item := file{
			Name: entry.Name(),
			Type: "file",
			Size: info.Size(),
		}
		if entry.IsDir() {
			item.Type = "dir"
			item.Size = 0
		}
		resp.Contents = append(resp.Contents, item)
	}

	respondSuccess(w, resp)
}
