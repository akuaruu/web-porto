package handler

import "testing"

func TestValidateFENRejectsUnsafePayload(t *testing.T) {
	tests := []string{
		"",
		"8/8/8/8/8/8/8/8 w - - 0 1\nuci",
		"8/8/8/8/8/8/8/8",
	}

	for _, fen := range tests {
		if err := validateFEN(fen); err == nil {
			t.Fatalf("expected invalid FEN for %q", fen)
		}
	}
}

func TestParseEngineMessages(t *testing.T) {
	info, ok := parseEngineInfo("info depth 12 seldepth 18 score cp 34 nodes 1000", "move-1")
	if !ok {
		t.Fatal("expected engine info")
	}
	if info["request_id"] != "move-1" || info["depth"] != 12 {
		t.Fatalf("unexpected info message: %+v", info)
	}

	move, ok := parseEngineMove("bestmove e7e5 ponder g1f3", "move-1")
	if !ok {
		t.Fatal("expected engine move")
	}
	if move["best_move"] != "e7e5" {
		t.Fatalf("unexpected move message: %+v", move)
	}
}
