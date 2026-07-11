import { useEffect, useRef, useCallback, useState } from "react";

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export interface EngineInfoMessage {
  type: "engine_info";
  request_id?: string;
  eval:
    | string
    | {
        type: "cp" | "mate" | "unknown";
        value: number | null;
        display: string;
      };
  depth: number | string;
}

export interface EngineMoveMessage {
  type: "engine_move";
  request_id?: string;
  best_move: string;
}

export interface PongMessage {
  type: "pong";
  request_id?: string;
  server_time?: string;
}

export interface ErrorMessage {
  type: "error";
  request_id?: string;
  message: string;
  error?: {
    code: string;
  };
}

export type ServerMessage =
  | EngineInfoMessage
  | EngineMoveMessage
  | PongMessage
  | ErrorMessage;

export interface TelemetryLog {
  id: number;
  timestamp: string;
  type: "info" | "move" | "sent" | "system";
  content: string;
}

interface UseChessWebSocketOptions {
  url: string;
  onEngineMove: (move: string) => void;
  onEngineInfo: (info: EngineInfoMessage) => void;
}

interface UseChessWebSocketReturn {
  status: ConnectionStatus;
  telemetryLogs: TelemetryLog[];
  sendMove: (fen: string) => void;
  connect: () => void;
  disconnect: () => void;
  latency: number | null;
}

let logIdCounter = 0;

function createLog(
  type: TelemetryLog["type"],
  content: string
): TelemetryLog {
  // Teks terminal yang nyasar sudah dihapus dari sini
  return {
    id: ++logIdCounter,
    timestamp: new Date().toISOString().split("T")[1].split(".")[0],
    type,
    content,
  };
}

export function useChessWebSocket({
  url,
  onEngineMove,
  onEngineInfo,
}: UseChessWebSocketOptions): UseChessWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pingTimestampRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const connectRef = useRef<(() => void) | null>(null);

  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLog[]>([]);
  const [latency, setLatency] = useState<number | null>(null);

  const addLog = useCallback((type: TelemetryLog["type"], content: string) => {
    setTelemetryLogs((prev) => {
      const next = [...prev, createLog(type, content)];
      return next.length > 100 ? next.slice(next.length - 100) : next;
    });
  }, []);

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      if (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      ) {
        wsRef.current.close(1000, "Client disconnect");
      }
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!isMountedRef.current) return;
    cleanup();

    addLog("system", `Connecting to ${url}...`);
    setStatus("connecting");

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isMountedRef.current) return;
      setStatus("connected");
      addLog("system", "WebSocket connection established");

      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          pingTimestampRef.current = Date.now();
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 5000);
    };

    ws.onmessage = (event: MessageEvent) => {
      if (!isMountedRef.current) return;

      try {
        const data = JSON.parse(event.data) as ServerMessage;

        if (data.type === "pong" && pingTimestampRef.current) {
          setLatency(Date.now() - pingTimestampRef.current);
          return;
        }

        if (data.type === "engine_info") {
          const depth = String(data.depth);
          const evalDisplay =
            typeof data.eval === "string" ? data.eval : data.eval.display;
          addLog(
            "info",
            `depth=${depth.padStart(2, "0")}  eval=${evalDisplay.padStart(6, " ")}`
          );
          onEngineInfo(data);
        } else if (data.type === "engine_move") {
          addLog("move", `best_move → ${data.best_move}`);
          onEngineMove(data.best_move);
        } else if (data.type === "error") {
          addLog(
            "system",
            `[ENGINE ERROR] ${data.error?.code ?? "UNKNOWN"} ${data.message}`
          );
        }
      } catch {
        addLog("system", `[PARSE ERROR] ${event.data}`);
      }
    };

    ws.onerror = () => {
      if (!isMountedRef.current) return;
      setStatus("error");
      addLog("system", "WebSocket error occurred");
    };

    ws.onclose = (event) => {
      if (!isMountedRef.current) return;
      setStatus("disconnected");
      addLog(
        "system",
        `Connection closed (code: ${event.code}) - reconnecting in 3s...`
      );
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      if (event.code !== 1000) {
        reconnectTimeoutRef.current = setTimeout(() => connectRef.current?.(), 3000);
      }
    };
  }, [url, cleanup, addLog, onEngineMove, onEngineInfo]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const disconnect = useCallback(() => {
    addLog("system", "Disconnected by user");
    cleanup();
    setStatus("disconnected");
  }, [cleanup, addLog]);

  const sendMove = useCallback(
    (fen: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const payload = JSON.stringify({ type: "player_move", fen });
        wsRef.current.send(payload);
        addLog("sent", `player_move → FEN: ${fen.slice(0, 30)}...`);
    } else {
        addLog("system", "[WARN] Cannot send - WebSocket not connected");
      }
    },
    [addLog]
  );

  useEffect(() => {
    isMountedRef.current = true;
    connect();
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { status, telemetryLogs, sendMove, connect, disconnect, latency };
}
