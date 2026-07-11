"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, Move, Square } from "chess.js";
import { BoardOrientation, Piece } from "react-chessboard/dist/chessboard/types";

interface ChessBoardProps {
  onPlayerMove: (fen: string) => void;
  engineMove: string | null;
  isEngineThinking: boolean;
}

interface GameStatus {
  isGameOver: boolean;
  result: string | null;
}

type PlayerColor = "w" | "b";

function getGameStatus(chess: Chess): GameStatus {
  if (chess.isCheckmate()) {
    const winner = chess.turn() === "w" ? "Black" : "White";
    return { isGameOver: true, result: `${winner} wins by checkmate!` };
  }
  if (chess.isDraw()) {
    let reason = "Draw";
    if (chess.isStalemate()) reason = "Draw by stalemate";
    else if (chess.isThreefoldRepetition()) reason = "Draw by threefold repetition";
    else if (chess.isInsufficientMaterial()) reason = "Draw by insufficient material";
    return { isGameOver: true, result: reason };
  }
  return { isGameOver: false, result: null };
}

function ColorPicker({ onSelect }: { onSelect: (color: PlayerColor) => void }) {
  function handleRandom() {
    onSelect(Math.random() < 0.5 ? "w" : "b");
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16 px-4">
      <div className="text-center">
        <p className="text-[10px] text-zinc-600 tracking-[0.3em] mb-2">CHOOSE SIDE</p>
        <h2 className="text-xl font-bold text-zinc-200 tracking-tight">Play as...</h2>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => onSelect("w")}
          className="group flex flex-col items-center gap-3 px-8 py-6 border border-zinc-700 rounded-xl bg-[#0d0d10] hover:border-zinc-400 hover:bg-zinc-900 transition-all duration-200"
        >
          <div className="w-14 h-14 rounded-full bg-zinc-200 flex items-center justify-center shadow-lg shadow-black/40 group-hover:scale-110 transition-transform duration-200">
            <span className="text-3xl select-none">♔</span>
          </div>
          <span className="font-mono text-xs text-zinc-400 tracking-widest group-hover:text-zinc-200 transition-colors">WHITE</span>
          <span className="font-mono text-[9px] text-zinc-700 tracking-wider">MOVES FIRST</span>
        </button>

        <button
          onClick={handleRandom}
          className="group flex flex-col items-center gap-3 px-8 py-6 border border-zinc-700 rounded-xl bg-[#0d0d10] hover:border-emerald-700 hover:bg-emerald-950/30 transition-all duration-200"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-800 flex items-center justify-center shadow-lg shadow-black/40 group-hover:scale-110 transition-transform duration-200">
            <span className="text-2xl select-none">⚄</span>
          </div>
          <span className="font-mono text-xs text-zinc-400 tracking-widest group-hover:text-emerald-400 transition-colors">RANDOM</span>
          <span className="font-mono text-[9px] text-zinc-700 tracking-wider">SURPRISE ME</span>
        </button>

        <button
          onClick={() => onSelect("b")}
          className="group flex flex-col items-center gap-3 px-8 py-6 border border-zinc-700 rounded-xl bg-[#0d0d10] hover:border-zinc-400 hover:bg-zinc-900 transition-all duration-200"
        >
          <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center shadow-lg shadow-black/40 border border-zinc-700 group-hover:scale-110 transition-transform duration-200">
            <span className="text-3xl select-none">♚</span>
          </div>
          <span className="font-mono text-xs text-zinc-400 tracking-widest group-hover:text-zinc-200 transition-colors">BLACK</span>
          <span className="font-mono text-[9px] text-zinc-700 tracking-wider">RESPONDS</span>
        </button>
      </div>
    </div>
  );
}

export default function ChessBoardComponent({
  onPlayerMove,
  engineMove,
  isEngineThinking,
}: ChessBoardProps) {
  const [game, setGame] = useState<Chess>(() => new Chess());
  const [playerColor, setPlayerColor] = useState<PlayerColor | null>(null);
  const [orientation, setOrientation] = useState<BoardOrientation>("white");
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, object>>({});
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>({ isGameOver: false, result: null });
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(0);

  // FIX: dependency `playerColor` memastikan effect re-run setelah warna dipilih
  // dan boardContainerRef sudah ada di DOM. Sebelumnya [] menyebabkan ref masih
  // null saat effect pertama kali berjalan (karena saat itu yang render adalah ColorPicker).
  useEffect(() => {
    const el = boardContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.round(entry.contentRect.width);
        setBoardWidth((prev) => (prev !== width ? width : prev));
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [playerColor]);

  const handleColorSelect = useCallback(
    (color: PlayerColor) => {
      setPlayerColor(color);
      setOrientation(color === "w" ? "white" : "black");
      if (color === "b") {
        onPlayerMove(new Chess().fen());
      }
    },
    [onPlayerMove]
  );

  useEffect(() => {
    if (!engineMove) return;
    const timer = setTimeout(() => {
      setGame((prev) => {
        const gameCopy = new Chess(prev.fen());
        try {
          const from = engineMove.slice(0, 2) as Square;
          const to = engineMove.slice(2, 4) as Square;
          const promotion = engineMove.length === 5
            ? (engineMove[4] as "q" | "r" | "b" | "n")
            : undefined;
          const move = gameCopy.move({ from, to, promotion });
          if (move) {
            setLastMove({ from: move.from, to: move.to });
            setMoveHistory((h) => [...h, move.san]);
            setGameStatus(getGameStatus(gameCopy));
            return gameCopy;
          }
        } catch {
          console.warn("Engine attempted invalid move:", engineMove);
        }
        return prev;
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [engineMove]);

  const getMoveOptions = useCallback((square: Square, currentGame: Chess): boolean => {
    const moves = currentGame.moves({ square, verbose: true }) as Move[];
    if (!moves.length) {
      setOptionSquares({});
      return false;
    }
    const squares: Record<string, object> = {
      [square]: { background: "rgba(16,185,129,0.25)" },
    };
    moves.forEach((m) => {
      const isCapture =
        !!currentGame.get(m.to) &&
        currentGame.get(m.to)?.color !== currentGame.get(square)?.color;
      squares[m.to] = {
        background: isCapture
          ? "radial-gradient(circle, rgba(239,68,68,0.5) 65%, transparent 65%)"
          : "radial-gradient(circle, rgba(16,185,129,0.4) 30%, transparent 30%)",
        borderRadius: "50%",
      };
    });
    setOptionSquares(squares);
    return true;
  }, []);

  function onSquareClick(square: Square) {
    if (!playerColor || gameStatus.isGameOver || isEngineThinking || game.turn() !== playerColor) return;

    if (!moveFrom) {
      const hasMoves = getMoveOptions(square, game);
      if (hasMoves) setMoveFrom(square);
      return;
    }

    const gameCopy = new Chess(game.fen());
    try {
      const move = gameCopy.move({ from: moveFrom, to: square, promotion: "q" });
      if (move) {
        setGame(gameCopy);
        setLastMove({ from: move.from, to: move.to });
        setMoveHistory((h) => [...h, move.san]);
        setOptionSquares({});
        setMoveFrom(null);
        const status = getGameStatus(gameCopy);
        setGameStatus(status);
        if (!status.isGameOver) onPlayerMove(gameCopy.fen());
        return;
      }
    } catch { /* not a valid move */ }

    const hasMoves = getMoveOptions(square, game);
    setMoveFrom(hasMoves ? square : null);
    if (!hasMoves) setOptionSquares({});
  }

  function onPieceDrop(sourceSquare: Square, targetSquare: Square, piece: Piece): boolean {
    if (!playerColor || gameStatus.isGameOver || isEngineThinking || game.turn() !== playerColor) return false;

    const gameCopy = new Chess(game.fen());
    try {
      const isPromotion =
        (piece === "wP" && targetSquare[1] === "8") ||
        (piece === "bP" && targetSquare[1] === "1");
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: isPromotion ? "q" : undefined,
      });
      if (!move) return false;

      setGame(gameCopy);
      setLastMove({ from: move.from, to: move.to });
      setMoveHistory((h) => [...h, move.san]);
      setOptionSquares({});
      setMoveFrom(null);
      const status = getGameStatus(gameCopy);
      setGameStatus(status);
      if (!status.isGameOver) onPlayerMove(gameCopy.fen());
      return true;
    } catch {
      return false;
    }
  }

  const handleReset = useCallback(() => {
    setGame(new Chess());
    setPlayerColor(null);
    setOrientation("white");
    setMoveHistory([]);
    setLastMove(null);
    setOptionSquares({});
    setMoveFrom(null);
    setGameStatus({ isGameOver: false, result: null });
    setBoardWidth(0);
  }, []);

  const handleFlip = useCallback(() => {
    setOrientation((o) => (o === "white" ? "black" : "white"));
  }, []);

  const customSquareStyles = useMemo(() => {
    const styles: Record<string, object> = { ...optionSquares };
    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: "rgba(245,158,11,0.25)" };
      styles[lastMove.to] = { backgroundColor: "rgba(245,158,11,0.35)" };
    }
    if (game.inCheck()) {
      const pieces = game.board().flat();
      for (const p of pieces) {
        if (p?.type === "k" && p.color === game.turn()) {
          styles[p.square] = { backgroundColor: "rgba(239,68,68,0.55)" };
          break;
        }
      }
    }
    return styles;
  }, [optionSquares, lastMove, game]);

  const isPlayerTurn = playerColor !== null && game.turn() === playerColor;
  const playerLabel = playerColor === "w" ? "WHITE" : "BLACK";

  if (!playerColor) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="bg-[#0a0a0c] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl shadow-black/60">
          <ColorPicker onSelect={handleColorSelect} />
        </div>
        <div className="bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 font-mono text-xs text-zinc-700 h-10 flex items-center">
          No moves yet...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {gameStatus.isGameOver ? (
            <span className="font-mono text-sm text-amber-400 tracking-wider">
              ♔ {gameStatus.result}
            </span>
          ) : isEngineThinking ? (
            <span className="font-mono text-sm text-cyan-400 tracking-wider flex items-center gap-2">
              <span className="inline-block animate-spin">⟳</span> ENGINE THINKING...
            </span>
          ) : (
            <span className={`font-mono text-sm tracking-wider ${isPlayerTurn ? "text-emerald-400" : "text-zinc-400"}`}>
              {isPlayerTurn ? "▶ YOUR TURN" : "⟳ ENGINE TO MOVE"}
            </span>
          )}
          {game.inCheck() && !gameStatus.isGameOver && (
            <span className="font-mono text-xs text-red-400 tracking-widest animate-pulse">CHECK!</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-zinc-600 tracking-widest px-2 py-1 border border-zinc-800 rounded">
            YOU: {playerLabel}
          </span>
          <button
            onClick={handleFlip}
            className="font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 border border-zinc-800 rounded hover:border-zinc-600"
          >
            ⇅ FLIP
          </button>
          <button
            onClick={handleReset}
            className="font-mono text-xs text-zinc-500 hover:text-red-400 transition-colors px-2 py-1 border border-zinc-800 rounded hover:border-red-900"
          >
            ↺ RESET
          </button>
        </div>
      </div>

      {/* Board */}
      <div
        ref={boardContainerRef}
        className="relative rounded-xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-zinc-800"
      >
        {isEngineThinking && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse" />
          </div>
        )}
        {boardWidth > 0 && (
          <Chessboard
            boardWidth={boardWidth}
            position={game.fen()}
            onSquareClick={onSquareClick}
            onPieceDrop={onPieceDrop}
            boardOrientation={orientation}
            customSquareStyles={customSquareStyles}
            customBoardStyle={{ borderRadius: "0", boxShadow: "none" }}
            customDarkSquareStyle={{ backgroundColor: "#2d4a35" }}
            customLightSquareStyle={{ backgroundColor: "#94b49f" }}
            animationDuration={200}
            areArrowsAllowed
          />
        )}
      </div>

      {/* Move history */}
      <div className="bg-[#0a0a0c] border border-zinc-800 rounded-lg px-3 py-2 font-mono text-xs text-zinc-500 h-10 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
        {moveHistory.length === 0 ? (
          <span className="text-zinc-700">No moves yet...</span>
        ) : (
          moveHistory.map((san, i) => (
            <span key={i}>
              {i % 2 === 0 && (
                <span className="text-zinc-700 mr-1">{Math.floor(i / 2) + 1}.</span>
              )}
              <span className={`mr-2 ${i === moveHistory.length - 1 ? "text-amber-400" : "text-zinc-400"}`}>
                {san}
              </span>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
