package store

type Store interface {
	CreateSession(username string) (string, error)
	GetSession(token string) (Session, bool)
	DeleteSession(token string)
	ValidateCredentials(username, password string) bool
}
