package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/goteleport-interview/int-fullstack-jason/api/store"
)

type MockStore struct {
	ValidateCredentialsFunc func(string, string) bool
	CreateSessionFunc       func(string) (string, error)
	DeleteSessionFunc       func(string)
	GetSessionFunc          func(string) (store.Session, bool)
}

func (m *MockStore) ValidateCredentials(username, password string) bool {
	if m.ValidateCredentialsFunc != nil {
		return m.ValidateCredentialsFunc(username, password)
	}
	return false
}

func (m *MockStore) CreateSession(username string) (string, error) {
	if m.CreateSessionFunc != nil {
		return m.CreateSessionFunc(username)
	}
	return "", nil
}

func (m *MockStore) DeleteSession(token string) {
	if m.DeleteSessionFunc != nil {
		m.DeleteSessionFunc(token)
	}
}

func (m *MockStore) GetSession(token string) (store.Session, bool) {
	if m.GetSessionFunc != nil {
		return m.GetSessionFunc(token)
	}
	return store.Session{}, false
}

func TestLogin_Success(t *testing.T) {
	h := &AuthHandler{
		Store: &MockStore{
			ValidateCredentialsFunc: func(username, password string) bool {
				return username == "test-user" && password == "test-password"
			},
			CreateSessionFunc: func(username string) (string, error) {
				return "test-session", nil
			},
		},
	}

	body, _ := json.Marshal(credentials{Username: "test-user", Password: "test-password"})
	req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewReader(body))
	rr := httptest.NewRecorder()

	h.Login(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected 200 OK, got %d", rr.Code)
	}

	var resp struct {
		Data struct {
			Username string `json:"username"`
		} `json:"data"`
	}

	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if resp.Data.Username != "test-user" {
		t.Errorf("expected username 'test-user', got '%s'", resp.Data.Username)
	}
	cookies := rr.Result().Cookies()
	if len(cookies) == 0 || cookies[0].Name != "session" {
		t.Error("Expected session cookie to be set")
	}
}

func TestLogin_InvalidCredentials(t *testing.T) {
	handler := &AuthHandler{
		Store: &MockStore{
			ValidateCredentialsFunc: func(_, _ string) bool {
				return false
			},
		},
	}

	body, _ := json.Marshal(credentials{Username: "baduser", Password: "wrong"})
	req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	handler.Login(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Errorf("expected 401 Unauthorized, got %d", rr.Code)
	}
}

func TestLogin_InvalidPayload(t *testing.T) {
	handler := &AuthHandler{}

	req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBufferString("{invalid payload"))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	handler.Login(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400 Bad Request, got %d", rr.Code)
	}
}

func TestLogout_Success(t *testing.T) {
	store := &MockStore{
		DeleteSessionFunc: func(token string) {
			if token != "test-session-token" {
				t.Errorf("expected token 'session-token', got %s", token)
			}
		},
	}
	handler := &AuthHandler{Store: store}

	req := httptest.NewRequest(http.MethodPost, "/logout", nil)
	req.AddCookie(&http.Cookie{Name: "session", Value: "test-session-token"})
	rr := httptest.NewRecorder()

	handler.Logout(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}
}

func TestValidateSession_NoCookie(t *testing.T) {
	handler := &AuthHandler{}

	req := httptest.NewRequest(http.MethodGet, "/validate", nil)
	rr := httptest.NewRecorder()

	handler.ValidateSession(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", rr.Code)
	}
}

func TestValidateSession_InvalidToken(t *testing.T) {
	store := &MockStore{
		GetSessionFunc: func(token string) (store.Session, bool) {
			return store.Session{}, false
		},
	}
	handler := &AuthHandler{Store: store}

	req := httptest.NewRequest(http.MethodGet, "/validate", nil)
	req.AddCookie(&http.Cookie{Name: "session", Value: "invalid-token"})
	rr := httptest.NewRecorder()

	handler.ValidateSession(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", rr.Code)
	}
}

func TestValidateSession_ValidToken(t *testing.T) {
	store := &MockStore{
		GetSessionFunc: func(token string) (store.Session, bool) {
			return store.Session{Username: "test-user"}, true
		},
	}
	handler := &AuthHandler{Store: store}

	req := httptest.NewRequest(http.MethodGet, "/validate", nil)
	req.AddCookie(&http.Cookie{Name: "session", Value: "valid-token"})
	rr := httptest.NewRecorder()

	handler.ValidateSession(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rr.Code)
	}

	var resp struct {
		Data struct {
			Username string `json:"username"`
		} `json:"data"`
	}
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatal("failed to decode response:", err)
	}
	if resp.Data.Username != "test-user" {
		t.Errorf("expected username 'test-user', got '%s'", resp.Data.Username)
	}
}
