package repository

import (
	"context"
	"web-porto-backend/internal/model"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository interface {
	GetByUsername(ctx context.Context, username string) (*model.User, error)
}

type userRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) UserRepository {
	return &userRepository{db}
}

func (r *userRepository) GetByUsername(ctx context.Context, username string) (*model.User, error) {
	var u model.User
	query := `SELECT id, username, password_hash, created_at FROM users WHERE username = $1`

	err := r.db.QueryRow(ctx, query, username).Scan(&u.ID, &u.Username, &u.PasswordHash, &u.CreatedAt)
	if err != nil {
		return nil, err
	}

	return &u, nil
}
