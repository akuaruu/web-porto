package handler

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"web-porto-backend/internal/middleware"
	"web-porto-backend/internal/usecase"

	"github.com/gorilla/websocket"
)

type ChessHandler struct {
	chessUsecase  usecase.ChessUsecase
	allowedOrigin []string
}

type chessClientMessage struct {
	Type      string `json:"type"`
	RequestID string `json:"request_id,omitempty"`
	FEN       string `json:"fen,omitempty"`
}

type chessError struct {
	Code string `json:"code"`
}

func NewChessHandler(u usecase.ChessUsecase, allowedOrigins []string) *ChessHandler {
	return &ChessHandler{chessUsecase: u, allowedOrigin: allowedOrigins}
}

func (h *ChessHandler) HandleChessWS(w http.ResponseWriter, r *http.Request) {
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return middleware.OriginAllowed(h.allowedOrigin, r.Header.Get("Origin"))
		},
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	defer conn.Close()
	conn.SetReadLimit(2048)

	ctx, cancel := context.WithCancel(r.Context())
	defer cancel()

	session, err := h.chessUsecase.StartEngine(ctx)
	if err != nil {
		writeWSJSON(conn, &sync.Mutex{}, map[string]any{
			"type":    "error",
			"message": "Engine unavailable",
			"error":   chessError{Code: "ENGINE_UNAVAILABLE"},
		})
		return
	}
	defer session.Close()

	var writeMu sync.Mutex
	var requestMu sync.RWMutex
	lastRequestID := ""

	go func() {
		for session.Scanner.Scan() {
			line := session.Scanner.Text()
			requestMu.RLock()
			requestID := lastRequestID
			requestMu.RUnlock()

			if msg, ok := parseEngineInfo(line, requestID); ok {
				_ = writeWSJSON(conn, &writeMu, msg)
				continue
			}
			if msg, ok := parseEngineMove(line, requestID); ok {
				_ = writeWSJSON(conn, &writeMu, msg)
			}
		}
	}()

	for {
		var msg chessClientMessage
		if err := conn.ReadJSON(&msg); err != nil {
			return
		}

		switch msg.Type {
		case "ping":
			_ = writeWSJSON(conn, &writeMu, map[string]any{
				"type":        "pong",
				"request_id":  msg.RequestID,
				"server_time": time.Now().UTC(),
			})
		case "player_move":
			if err := validateFEN(msg.FEN); err != nil {
				_ = writeWSJSON(conn, &writeMu, wsError(msg.RequestID, "Invalid FEN", "INVALID_FEN"))
				continue
			}

			requestMu.Lock()
			lastRequestID = msg.RequestID
			requestMu.Unlock()

			if _, err := io.WriteString(session.Stdin, fmt.Sprintf("position fen %s\n", msg.FEN)); err != nil {
				_ = writeWSJSON(conn, &writeMu, wsError(msg.RequestID, "Engine unavailable", "ENGINE_UNAVAILABLE"))
				return
			}
			if _, err := io.WriteString(session.Stdin, "go depth 15\n"); err != nil {
				_ = writeWSJSON(conn, &writeMu, wsError(msg.RequestID, "Engine unavailable", "ENGINE_UNAVAILABLE"))
				return
			}
		default:
			_ = writeWSJSON(conn, &writeMu, wsError(msg.RequestID, "Invalid message", "INVALID_MESSAGE"))
		}
	}
}

func writeWSJSON(conn *websocket.Conn, mu *sync.Mutex, payload any) error {
	mu.Lock()
	defer mu.Unlock()

	_ = conn.SetWriteDeadline(time.Now().Add(5 * time.Second))
	return conn.WriteJSON(payload)
}

func validateFEN(fen string) error {
	fen = strings.TrimSpace(fen)
	if fen == "" || len(fen) > 120 || strings.ContainsAny(fen, "\r\n") {
		return fmt.Errorf("invalid fen")
	}
	if len(strings.Fields(fen)) < 4 {
		return fmt.Errorf("invalid fen")
	}
	return nil
}

func wsError(requestID, message, code string) map[string]any {
	return map[string]any{
		"type":       "error",
		"request_id": requestID,
		"message":    message,
		"error":      chessError{Code: code},
	}
}

func parseEngineInfo(line, requestID string) (map[string]any, bool) {
	if !strings.HasPrefix(line, "info ") || !strings.Contains(line, " depth ") || !strings.Contains(line, " score ") {
		return nil, false
	}

	parts := strings.Fields(line)
	depth, _ := strconv.Atoi(stockfishValue(parts, "depth"))
	scoreType := stockfishValue(parts, "score")
	scoreValue := stockfishValue(parts, scoreType)
	value, err := strconv.Atoi(scoreValue)
	if err != nil {
		return nil, false
	}

	return map[string]any{
		"type":       "engine_info",
		"request_id": requestID,
		"depth":      depth,
		"eval": map[string]any{
			"type":    scoreType,
			"value":   value,
			"display": formatEval(scoreType, value),
		},
	}, true
}

func parseEngineMove(line, requestID string) (map[string]any, bool) {
	if !strings.HasPrefix(line, "bestmove") {
		return nil, false
	}

	parts := strings.Fields(line)
	if len(parts) < 2 {
		return nil, false
	}

	return map[string]any{
		"type":       "engine_move",
		"request_id": requestID,
		"best_move":  parts[1],
	}, true
}

func stockfishValue(parts []string, key string) string {
	for i, part := range parts {
		if part == key && i+1 < len(parts) {
			return parts[i+1]
		}
	}
	return ""
}

func formatEval(scoreType string, value int) string {
	switch scoreType {
	case "cp":
		return fmt.Sprintf("%+.2f", float64(value)/100)
	case "mate":
		return fmt.Sprintf("M%d", value)
	default:
		return "0"
	}
}
