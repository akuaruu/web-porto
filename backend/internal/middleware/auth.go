package middleware

import (
	"errors"
	"net/http"
	"strings"
	"web-porto-backend/pkg/response"

	"github.com/golang-jwt/jwt/v5"
)

func RequireAuth(jwtSecret string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			response.Fail(w, http.StatusUnauthorized, "Missing or invalid authorization token", response.CodeUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if strings.TrimSpace(tokenString) == "" {
			response.Fail(w, http.StatusUnauthorized, "Missing or invalid authorization token", response.CodeUnauthorized)
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("unexpected signing method")
			}
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			response.Fail(w, http.StatusUnauthorized, "Missing or invalid authorization token", response.CodeUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	}
}
