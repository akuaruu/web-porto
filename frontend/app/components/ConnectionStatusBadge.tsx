"use client";

import { ConnectionStatus } from "@/hooks/useChessWebSocket";

interface ConnectionStatusBadgeProps {
  status: ConnectionStatus;
  latency: number | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

const STATUS_CONFIG: Record<
  ConnectionStatus,
  { label: string; color: string; pulse: boolean; dot: string }
> = {
  connected: {
    label: "CONNECTED",
    color: "text-emerald-400",
    pulse: true,
    dot: "bg-emerald-400",
  },
  connecting: {
    label: "CONNECTING",
    color: "text-amber-400",
    pulse: true,
    dot: "bg-amber-400",
  },
  disconnected: {
    label: "OFFLINE",
    color: "text-zinc-500",
    pulse: false,
    dot: "bg-zinc-500",
  },
  error: {
    label: "ERROR",
    color: "text-red-400",
    pulse: false,
    dot: "bg-red-400",
  },
};

export default function ConnectionStatusBadge({
  status,
  latency,
  onConnect,
  onDisconnect,
}: ConnectionStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-3 font-mono text-xs">
      {/* Dot indicator */}
      <div className="relative flex items-center justify-center w-3 h-3">
        {cfg.pulse && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-60 animate-ping`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`} />
      </div>

      {/* Status label */}
      <span className={`tracking-widest ${cfg.color}`}>{cfg.label}</span>

      {/* Latency */}
      {latency !== null && status === "connected" && (
        <span className="text-zinc-600">
          {latency}
          <span className="text-zinc-700">ms</span>
        </span>
      )}

      {/* Divider */}
      <span className="text-zinc-700">|</span>

      {/* Action button */}
      {status === "disconnected" || status === "error" ? (
        <button
          onClick={onConnect}
          className="text-zinc-400 hover:text-emerald-400 transition-colors duration-150 tracking-wider"
        >
          RECONNECT
        </button>
      ) : (
        <button
          onClick={onDisconnect}
          className="text-zinc-600 hover:text-red-400 transition-colors duration-150 tracking-wider"
        >
          DISCONNECT
        </button>
      )}
    </div>
  );
}