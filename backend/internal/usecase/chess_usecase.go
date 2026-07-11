package usecase

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
)

type ChessUsecase interface {
	StartEngine(ctx context.Context) (*EngineSession, error)
}

type EngineSession struct {
	Stdin   io.WriteCloser
	Scanner *bufio.Scanner
	cmd     *exec.Cmd
}

type chessUsecase struct{}

func NewChessUsecase() ChessUsecase {
	return &chessUsecase{}
}

func (u *chessUsecase) StartEngine(ctx context.Context) (*EngineSession, error) {
	stockfishPath := os.Getenv("STOCKFISH_PATH")
	if stockfishPath == "" {
		stockfishPath = "./bin/stockfish"
	}

	cmd := exec.CommandContext(ctx, stockfishPath)

	stdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, fmt.Errorf("stdin error: %v", err)
	}

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, fmt.Errorf("stdout error: %v", err)
	}

	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("engine start error: %v", err)
	}

	// Scanner membaca stream stdout dari Stockfish secara terus-menerus
	scanner := bufio.NewScanner(stdout)

	return &EngineSession{Stdin: stdin, Scanner: scanner, cmd: cmd}, nil
}

func (s *EngineSession) Close() error {
	if s == nil {
		return nil
	}

	if s.Stdin != nil {
		_, _ = io.WriteString(s.Stdin, "quit\n")
		_ = s.Stdin.Close()
	}
	if s.cmd != nil && s.cmd.Process != nil {
		_ = s.cmd.Process.Kill()
		return s.cmd.Wait()
	}
	return nil
}
