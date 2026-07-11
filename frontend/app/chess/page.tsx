"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { EngineInfoMessage, useChessWebSocket } from "@/hooks/useChessWebSocket";
import TelemetryPanel from "@/app/components/TelemetryPanel";
import ConnectionStatusBadge from "@/app/components/ConnectionStatusBadge";

const ChessBoardComponent = dynamic(() => import("@/app/components/ChessBoard"), {
  ssr: false,
  loading: () => (
    <div className="aspect-square w-full bg-[#0a0a0c] border border-zinc-800 rounded-xl flex items-center justify-center">
      <span className="font-mono text-zinc-600 text-sm tracking-widest animate-pulse">
        LOADING BOARD...
      </span>
    </div>
  ),
});

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws/chess";

export default function ChessEnginePage() {
  const [engineMove, setEngineMove] = useState<string | null>(null);
  const [isEngineThinking, setIsEngineThinking] = useState(false);
  const [evalScore, setEvalScore] = useState<string | null>(null);
  const [depth, setDepth] = useState<string | null>(null);

  const handleEngineMove = useCallback((move: string) => {
    setEngineMove(move);
    setIsEngineThinking(false);
  }, []);

  const handleEngineInfo = useCallback((info: EngineInfoMessage) => {
    setEvalScore(typeof info.eval === "string" ? info.eval : info.eval.display);
    setDepth(String(info.depth));
    setIsEngineThinking(true);
  }, []);

  const { status, telemetryLogs, sendMove, connect, disconnect, latency } =
    useChessWebSocket({
      url: WS_URL,
      onEngineMove: handleEngineMove,
      onEngineInfo: handleEngineInfo,
    });

  const handlePlayerMove = useCallback(
    (fen: string) => {
      setIsEngineThinking(true);
      setEngineMove(null);
      sendMove(fen);
    },
    [sendMove]
  );

  return (
    // overflow-x-hidden: mencegah konten yang overflow ke kanan menyebabkan page shift
    <main
      className="min-h-[100dvh] bg-[#07070a] text-white overflow-x-hidden"
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
    >
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link
              href="/#chess"
              className="mb-4 inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-[11px] text-zinc-400 transition hover:border-emerald-300/30 hover:text-emerald-100"
            >
              Back to portfolio
            </Link>
            <div className="text-[10px] text-zinc-600 tracking-[0.3em] mb-1">
              PORTFOLIO / CHESS ENGINE
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
              Live Chess Engine
            </h1>
            <p className="text-xs text-zinc-600 mt-1">
              Powered by Stockfish · Real-time WebSocket · Golang backend
            </p>
          </div>

          <ConnectionStatusBadge
            status={status}
            latency={latency}
            onConnect={connect}
            onDisconnect={disconnect}
          />
        </header>

        {/* Main layout */}
        {/*
          items-start  → grid children tidak stretch satu sama lain
          min-w-0      → tiap kolom tidak bisa overflow melebihi lebar yang dialokasikan grid
        */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* Chessboard column */}
          {/* min-w-0: wajib pada grid child agar tidak bisa tumbuh melebihi 1fr */}
          <div className="flex flex-col gap-4 min-w-0">
            <div className="flex items-center gap-4 text-[10px] text-zinc-600 tracking-widest">
              <span>YOU → WHITE</span>
              <span className="text-zinc-800">·</span>
              <span>ENGINE → BLACK</span>
              <span className="text-zinc-800">·</span>
              <span>STOCKFISH 16</span>
            </div>

            <ChessBoardComponent
              onPlayerMove={handlePlayerMove}
              engineMove={engineMove}
              isEngineThinking={isEngineThinking}
            />
          </div>

          {/* Telemetry column */}
          <div className="min-w-0">
            <TelemetryPanel
              logs={telemetryLogs}
              evalScore={evalScore}
              depth={depth}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-zinc-900 flex items-center justify-between">
          <span className="text-[10px] text-zinc-700 tracking-widest">
            WS: {WS_URL}
          </span>
          <span className="text-[10px] text-zinc-700 tracking-widest">
            CLEAN ARCHITECTURE · NEXT.JS + GO
          </span>
        </footer>
      </div>
    </main>
  );
}
