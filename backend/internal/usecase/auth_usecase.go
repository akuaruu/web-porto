package usecase

import (
	"context"
	"errors"
	"time"
	"web-porto-backend/internal/repository"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthUsecase interface {
	Login(ctx context.Context, username, password string) (string, time.Time, error)
}

type authUsecase struct {
	userRepo  repository.UserRepository
	jwtSecret string
}

var ErrInvalidCredentials = errors.New("invalid credentials")

func NewAuthUsecase(userRepo repository.UserRepository, jwtSecret string) AuthUsecase {
	return &authUsecase{userRepo: userRepo, jwtSecret: jwtSecret}
}

func (u *authUsecase) Login(ctx context.Context, username, password string) (string, time.Time, error) {
	if username == "" || password == "" {
		return "", time.Time{}, ErrValidation
	}

	user, err := u.userRepo.GetByUsername(ctx, username)
	if err != nil {
		return "", time.Time{}, ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return "", time.Time{}, ErrInvalidCredentials
	}

	expiresAt := time.Now().UTC().Add(time.Hour * 24)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": expiresAt.Unix(),
	})

	signed, err := token.SignedString([]byte(u.jwtSecret))
	if err != nil {
		return "", time.Time{}, err
	}

	return signed, expiresAt, nil
}
