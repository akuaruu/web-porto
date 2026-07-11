"use client";

import { useEffect, useRef } from "react";
import { TelemetryLog } from "@/hooks/useChessWebSocket";

interface TelemetryPanelProps {
  logs: TelemetryLog[];
  evalScore: string | null;
  depth: string | null;
}

const LOG_STYLES: Record<TelemetryLog["type"], string> = {
  info: "text-cyan-400",
  move: "text-emerald-400",
  sent: "text-amber-400",
  system: "text-zinc-500",
};

const LOG_PREFIX: Record<TelemetryLog["type"], string> = {
  info: "INFO",
  move: "MOVE",
  sent: " OUT",
  system: " SYS",
};

export default function TelemetryPanel({ logs, evalScore, depth }: TelemetryPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight - el.clientHeight;
  }, [logs]);

  const evalNum = evalScore ? parseFloat(evalScore) : null;
  const isPositive = evalNum !== null && evalNum > 0;
  const evalColor =
    evalNum === null
      ? "text-zinc-500"
      : isPositive
        ? "text-emerald-400"
        : evalNum < 0
          ? "text-red-400"
          : "text-zinc-400";

  const barPercent =
    evalNum !== null ? Math.min(100, Math.max(0, ((evalNum + 5) / 10) * 100)) : 50;

  return (
    <div
      className="flex flex-col h-[600px] lg:h-[640px] bg-[#0a0a0c] border border-zinc-800 rounded-xl overflow-hidden shadow-xl shadow-black/50"
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-[#0d0d10] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-zinc-700" />
          <div className="w-2 h-2 rounded-full bg-zinc-700" />
          <div className="w-2 h-2 rounded-full bg-zinc-700" />
        </div>
        <span className="text-xs text-zinc-600 tracking-widest">ENGINE TELEMETRY</span>
        <span className="text-xs text-zinc-700">STOCKFISH</span>
      </div>

      {/* Eval scoreboard */}
      <div className="px-4 py-3 border-b border-zinc-800/60 bg-[#0c0c0f] shrink-0">
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className="text-[10px] text-zinc-600 tracking-widest mb-0.5">EVALUATION</div>
            <div className={`text-2xl font-bold tabular-nums ${evalColor}`}>
              {evalScore ?? "--"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-zinc-600 tracking-widest mb-0.5">DEPTH</div>
            <div className="text-2xl font-bold text-zinc-400 tabular-nums">
              {depth ?? "--"}
            </div>
          </div>
        </div>
        <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className="absolute left-1/2 top-0 w-px h-full bg-zinc-600 z-10" />
          <div
            className={`absolute top-0 h-full transition-all duration-300 rounded-full ${isPositive ? "bg-emerald-500 left-1/2" : "bg-red-500 right-1/2"
              }`}
            style={{ width: `${Math.abs(barPercent - 50)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-zinc-700">BLACK</span>
          <span className="text-[9px] text-zinc-700">WHITE</span>
        </div>
      </div>

      {/* Log stream */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800"
      >
        {logs.length === 0 && (
          <p className="text-zinc-700 text-xs mt-4 text-center tracking-wider">
            AWAITING ENGINE DATA...
          </p>
        )}
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-2 text-xs leading-5 hover:bg-white/5 transition-colors px-1 rounded"
          >
            <span className="text-zinc-700 shrink-0 tabular-nums">{log.timestamp}</span>
            <span className={`shrink-0 ${LOG_STYLES[log.type]}`}>
              [{LOG_PREFIX[log.type]}]
            </span>
            <span className="text-zinc-400 break-all">{log.content}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-zinc-800 bg-[#0d0d10] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-emerald-500 text-xs animate-pulse">▋</span>
          <span className="text-zinc-700 text-[10px] tracking-widest">
            {logs.length} EVENTS LOGGED
          </span>
        </div>
        <span className="text-[10px] text-zinc-800">I/O STREAM</span>
      </div>
    </div>
  );
}
