package store

import (
	"crypto/rand"
	"encoding/base64"
	"sync"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type Session struct {
	Username string    `json:"username"`
	Expires  time.Time `json:"expires"`
}

type MemoryStore struct {
	sessions map[string]Session
	users    map[string]string
	mu       sync.Mutex
}

var fakeHash = "$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5sGybga3SPr3toJ/x/3ycH7V7y5Yu"

func (s *MemoryStore) CreateSession(username string) (string, error) {
	sessionToken, err := GenerateSessionToken(32)
	if err != nil {
		return "", err
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	s.sessions[sessionToken] = Session{
		Username: username,
		Expires:  time.Now().Add(15 * time.Minute),
	}
	return sessionToken, nil
}

func (s *MemoryStore) GetSession(token string) (Session, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	session, ok := s.sessions[token]
	if !ok || time.Now().After(session.Expires) {
		return Session{}, false
	}
	return session, true
}

func (s *MemoryStore) DeleteSession(token string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.sessions, token)
}

func (s *MemoryStore) ValidateCredentials(username, password string) bool {
	hashedPassword, exists := s.users[username]
	if !exists {
		_ = bcrypt.CompareHashAndPassword([]byte(fakeHash), []byte(password))
		return false
	}

	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

func NewMemoryStore() *MemoryStore {
	return &MemoryStore{
		sessions: make(map[string]Session),
		users: map[string]string{
			"testuser": "$2a$10$7VugrrmE88DB7WM3HLvaRO/SkfvC3QKoPN6Os8txz1c6RqGMj6wQS",
		},
	}
}

func GenerateSessionToken(length int) (string, error) {
	b := make([]byte, length)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(b), nil
}
