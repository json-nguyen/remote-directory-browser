# Remote Directory Browser

A secure, authenticated web application for browsing remote directories.  

---

## Features

- Session-based authentication with secure cookie handling
- HTTPS/TLS enforced for backend API communication
- Browse and navigate directories with breadcrumb navigation
- Client-side sorting, filtering, and search
- URL-based state management (paths, search, sort reflected in URL for bookmarking/sharing)
- Path traversal protection and secure input validation
- Built with React (TypeScript) and Go
---

## Tech Stack

- **Frontend:** React (TypeScript), Vite, Styled Components
- **Backend:** Go (net/http), custom middleware
- **Security:** TLS, secure cookies, CSRF protection (if applicable)
- **Testing:** Vitest (or other testing framework)
- **Tooling:** GitLab CI (if applicable)

---

## Architecture Highlights

- Backend serves directory data over a REST API secured with TLS.
- Sessions managed via HTTP-only, Secure cookies.
- Directory state (path, sort, filter) synced to URL for deep linking.
- Sorting and filtering performed client-side.
- Middleware handles auth validation and security checks.

---

## Design

- **Authentication:** Session-based authentication with secure cookie handling.
- **URL-based state:** Supports direct links/bookmarks to specific views.
- **Security:** Enforced HTTPS, input sanitization, path traversal safeguards, and strict cookie flags.
- **Frontend design:** Modular React components with clean, maintainable TypeScript code.

---

## Instructions To Run App

The Go backend in this repository uses the [`embed`](https://pkg.go.dev/embed)
package to embed the React app inside the Go binary. Running `go build` in the
root will capture whatever is present in the `web/build` subdirectory.

To ensure you have an up to date copy of the web app in your binary, you should:

- `cd web`
- `pnpm install`
- `pnpm build`
- `cd ..`
- `go build`

You can also run this locally by running the api and front end locally

```
$ cd web
$ pnpm start
```

```
$ cd api
$ pnpm go run main.go
```

