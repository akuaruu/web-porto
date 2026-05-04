"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play,
    Copy,
    Check,
    Clock,
    ChevronRight,
    Terminal,
    Zap,
    RotateCcw,
    Code2,
    Hash,
    AlertCircle,
} from "lucide-react";
import { executePlaygroundRequest } from "@/lib/api";
import type {
    EndpointDefinition,
    HttpMethod,
    PlaygroundResponse,
    RequestHistoryEntry,
} from "@/types";

// ─── Endpoint Registry 

const ENDPOINTS: EndpointDefinition[] = [
    {
        id: "list-projects",
        label: "List Projects",
        method: "GET",
        path: "/api/v1/projects",
        description: "Returns all projects stored in PostgreSQL.",
        group: "Projects",
    },
    {
        id: "get-project",
        label: "Get Project",
        method: "GET",
        path: "/api/v1/projects/:id",
        description: "Fetch a single project by its UUID.",
        group: "Projects",
        params: { id: "your-uuid-here" },
    },
    {
        id: "create-project",
        label: "Create Project",
        method: "POST",
        path: "/api/v1/projects",
        description: "Create a new project entry.",
        group: "Projects",
        sampleBody: JSON.stringify(
            {
                title: "My Go API",
                description: "A fast REST API built with Go and PostgreSQL.",
                tech_stack: ["Go", "PostgreSQL", "Docker"],
                is_featured: true,
            },
            null,
            2
        ),
    },
    {
        id: "health",
        label: "Health Check",
        method: "GET",
        path: "/api/v1/health",
        description: "Verify the API server is alive and responsive.",
        group: "System",
    },
];

// ─── Helpers

const METHOD_STYLES: Record<HttpMethod, string> = {
    GET: "text-[#39ff14]   bg-[#39ff14]/10   border-[#39ff14]/25",
    POST: "text-[#00acd7]   bg-[#00acd7]/10   border-[#00acd7]/25",
    PUT: "text-[#f5a623]   bg-[#f5a623]/10   border-[#f5a623]/25",
    PATCH: "text-[#a78bfa]   bg-[#a78bfa]/10   border-[#a78bfa]/25",
    DELETE: "text-[#ff4d4d]   bg-[#ff4d4d]/10   border-[#ff4d4d]/25",
};

const STATUS_STYLE = (code: number) => {
    if (code === 0) return "text-white/40 bg-white/5 border-white/10";
    if (code >= 200 && code < 300) return "text-[#39ff14] bg-[#39ff14]/10 border-[#39ff14]/25";
    if (code >= 300 && code < 400) return "text-[#00acd7] bg-[#00acd7]/10 border-[#00acd7]/25";
    if (code >= 400 && code < 500) return "text-[#f5a623] bg-[#f5a623]/10 border-[#f5a623]/25";
    return "text-[#ff4d4d] bg-[#ff4d4d]/10 border-[#ff4d4d]/25";
};

const BASE = "http://localhost:8080";

function buildUrl(path: string, params?: Record<string, string>): string {
    let resolved = path;
    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            resolved = resolved.replace(`:${k}`, v);
        });
    }
    return `${BASE}${resolved}`;
}

function buildCurl(method: HttpMethod, url: string, body?: string): string {
    const bodyPart =
        body && method !== "GET" && method !== "DELETE"
            ? ` \\\n  -d '${body.replace(/\n/g, "")}'`
            : "";
    return `curl -X ${method} '${url}' \\\n  -H 'Content-Type: application/json'${bodyPart}`;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
}

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
    return arr.reduce((acc, item) => {
        const k = key(item);
        if (!acc[k]) acc[k] = [];
        acc[k].push(item);
        return acc;
    }, {} as Record<string, T[]>);
}

// ─── JSON Syntax Highlighter 

function highlightJson(json: string): React.ReactNode {
    const lines = json.split("\n");
    return lines.map((line, i) => {
        const highlighted = line
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        return `<span class="text-[#00acd7]">${match}</span>`;
                    }
                    return `<span class="text-[#f5a623]">${match}</span>`;
                }
                if (/true|false/.test(match)) {
                    return `<span class="text-[#39ff14]">${match}</span>`;
                }
                if (/null/.test(match)) {
                    return `<span class="text-white/30">${match}</span>`;
                }
                return `<span class="text-[#a78bfa]">${match}</span>`;
            });
        return (
            <div key={i} className="flex">
                <span className="select-none w-8 shrink-0 text-right pr-3 text-white/15 text-[10px] leading-5">
                    {i + 1}
                </span>
                <span
                    className="text-white/60 leading-5"
                    dangerouslySetInnerHTML={{ __html: highlighted }}
                />
            </div>
        );
    });
}

// ─── Sub-components 

function MethodBadge({ method }: { method: HttpMethod }) {
    return (
        <span
            className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide ${METHOD_STYLES[method]}`}
        >
            {method}
        </span>
    );
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={copy}
            className="flex items-center gap-1 rounded-lg border border-white/5 bg-white/5 px-2 py-1 font-mono text-[10px] text-white/40 hover:text-white/70 hover:border-white/10 transition-colors"
        >
            {copied ? <Check size={10} className="text-[#39ff14]" /> : <Copy size={10} />}
            {copied ? "Copied!" : "Copy"}
        </motion.button>
    );
}

// ─── Main Component 

export function ApiPlayground() {
    const [selected, setSelected] = useState<EndpointDefinition>(ENDPOINTS[0]);
    const [customPath, setCustomPath] = useState(ENDPOINTS[0].path);
    const [body, setBody] = useState(ENDPOINTS[0].sampleBody ?? "");
    const [params, setParams] = useState<Record<string, string>>(ENDPOINTS[0].params ?? {});
    const [response, setResponse] = useState<PlaygroundResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<RequestHistoryEntry[]>([]);
    const [activeTab, setActiveTab] = useState<"response" | "headers" | "curl">("response");
    const bodyRef = useRef<HTMLTextAreaElement>(null);

    const resolvedUrl = buildUrl(customPath, Object.keys(params).length ? params : undefined);
    const curlCmd = buildCurl(selected.method, resolvedUrl, body || undefined);

    const selectEndpoint = useCallback((ep: EndpointDefinition) => {
        setSelected(ep);
        setCustomPath(ep.path);
        setBody(ep.sampleBody ?? "");
        setParams(ep.params ?? {});
        setResponse(null);
        setActiveTab("response");
    }, []);

    const send = useCallback(async () => {
        if (loading) return;
        setLoading(true);
        setResponse(null);

        const result = await executePlaygroundRequest(
            selected.method,
            resolvedUrl,
            body || undefined
        );

        setResponse(result);
        setLoading(false);

        setHistory((prev) => [
            {
                id: crypto.randomUUID(),
                method: selected.method,
                url: resolvedUrl,
                statusCode: result.statusCode,
                latencyMs: result.latencyMs,
                timestamp: new Date(),
                responseSize: result.size,
            },
            ...prev.slice(0, 9),
        ]);
    }, [loading, selected, resolvedUrl, body]);

    const spamAttack = useCallback(async () => {
        if (loading) return;
        setLoading(true);
        setResponse(null);

        // Tembak 50 request sekaligus secara brutal!
        const totalSpam = 1000;
        const promises = Array.from({ length: totalSpam }).map(async () => {
            // Kita serang endpoint yang sedang dipilih
            const result = await executePlaygroundRequest(
                selected.method,
                resolvedUrl,
                body || undefined
            );

            // Laporkan ke Telemetry Card
            if (result.statusCode === 429) {
                window.dispatchEvent(new CustomEvent("telemetry", { detail: "blocked" }));
            } else if (result.statusCode >= 200 && result.statusCode < 300) {
                window.dispatchEvent(new CustomEvent("telemetry", { detail: "success" }));
            }

            return result;
        });

        // Tunggu semua tembakan selesai, lalu tampilkan hasil tembakan terakhir
        const results = await Promise.all(promises);
        setResponse(results[results.length - 1]);
        setLoading(false);
    }, [loading, selected, resolvedUrl, body]);

    const grouped = groupBy(ENDPOINTS, (e) => e.group);

    return (
        <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-white/5 bg-[#111111] overflow-hidden"
        >
            {/* ── Section Header ── */}
            <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#39ff14]/10 border border-[#39ff14]/20">
                    <Zap size={13} className="text-[#39ff14]" />
                </div>
                <div>
                    <h2 className="font-mono text-sm font-semibold text-white">
                        API Playground
                    </h2>
                    <p className="font-mono text-[10px] text-white/30">
                        Live requests to the Go backend · localhost:8080
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <motion.span
                        className="font-mono text-[10px] text-[#39ff14]/50"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                    >
                        ● CONNECTED
                    </motion.span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row min-h-[600px]">
                {/* ── LEFT: Endpoint Sidebar ── */}
                <div className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-white/5 p-4 space-y-4 overflow-y-auto">
                    {Object.entries(grouped).map(([group, eps]) => (
                        <div key={group}>
                            <div className="flex items-center gap-1.5 mb-2">
                                <Hash size={10} className="text-white/20" />
                                <span className="font-mono text-[10px] font-semibold text-white/25 uppercase tracking-widest">
                                    {group}
                                </span>
                            </div>
                            <div className="space-y-1">
                                {eps.map((ep) => (
                                    <motion.button
                                        key={ep.id}
                                        whileHover={{ x: 2 }}
                                        onClick={() => selectEndpoint(ep)}
                                        className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors ${selected.id === ep.id
                                            ? "bg-[#39ff14]/8 border border-[#39ff14]/15"
                                            : "border border-transparent hover:bg-white/3 hover:border-white/5"
                                            }`}
                                    >
                                        <MethodBadge method={ep.method} />
                                        <span className="font-mono text-xs text-white/60 truncate">
                                            {ep.label}
                                        </span>
                                        {selected.id === ep.id && (
                                            <ChevronRight size={10} className="ml-auto shrink-0 text-[#39ff14]/60" />
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Request history */}
                    {history.length > 0 && (
                        <div>
                            <div className="flex items-center gap-1.5 mb-2">
                                <Clock size={10} className="text-white/20" />
                                <span className="font-mono text-[10px] font-semibold text-white/25 uppercase tracking-widest">
                                    History
                                </span>
                            </div>
                            <div className="space-y-1">
                                {history.slice(0, 5).map((h) => (
                                    <div
                                        key={h.id}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                                    >
                                        <MethodBadge method={h.method} />
                                        <span
                                            className={`font-mono text-[10px] ml-auto tabular-nums ${h.statusCode >= 200 && h.statusCode < 300
                                                ? "text-[#39ff14]/60"
                                                : "text-[#f5a623]/60"
                                                }`}
                                        >
                                            {h.statusCode || "ERR"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── RIGHT: Request + Response ── */}
                <div className="flex-1 flex flex-col min-w-0">

                    {/* ── Request builder ── */}
                    <div className="border-b border-white/5 p-5 space-y-4">
                        {/* Description */}
                        <p className="font-mono text-[11px] text-white/35 leading-relaxed">
                            {selected.description}
                        </p>

                        {/* URL bar */}
                        <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-[#0d0d0d] px-3 py-2.5 focus-within:border-[#39ff14]/25 transition-colors">
                            <MethodBadge method={selected.method} />
                            <span className="font-mono text-[11px] text-white/25 shrink-0">
                                {BASE}
                            </span>
                            <input
                                value={customPath}
                                onChange={(e) => setCustomPath(e.target.value)}
                                className="flex-1 bg-transparent font-mono text-[11px] text-white/70 outline-none placeholder:text-white/20 min-w-0"
                                spellCheck={false}
                            />
                        </div>

                        {/* Path params */}
                        {Object.keys(params).length > 0 && (
                            <div className="space-y-2">
                                <span className="font-mono text-[10px] text-white/25 uppercase tracking-widest">
                                    Path Params
                                </span>
                                {Object.entries(params).map(([k, v]) => (
                                    <div key={k} className="flex items-center gap-2">
                                        <span className="font-mono text-[10px] text-[#00acd7] w-20 shrink-0">
                                            :{k}
                                        </span>
                                        <input
                                            value={v}
                                            onChange={(e) =>
                                                setParams((p) => ({ ...p, [k]: e.target.value }))
                                            }
                                            className="flex-1 rounded-lg border border-white/8 bg-[#0d0d0d] px-3 py-1.5 font-mono text-[11px] text-white/70 outline-none focus:border-[#39ff14]/25 transition-colors"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Body editor */}
                        {(selected.method === "POST" ||
                            selected.method === "PUT" ||
                            selected.method === "PATCH") && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-[10px] text-white/25 uppercase tracking-widest">
                                            Request Body
                                        </span>
                                        <div className="flex gap-2">
                                            {body && <CopyButton text={body} />}
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setBody(selected.sampleBody ?? "")}
                                                className="flex items-center gap-1 rounded-lg border border-white/5 bg-white/5 px-2 py-1 font-mono text-[10px] text-white/40 hover:text-white/70 transition-colors"
                                            >
                                                <RotateCcw size={10} />
                                                Reset
                                            </motion.button>
                                        </div>
                                    </div>
                                    <div className="relative rounded-xl border border-white/8 bg-[#0d0d0d] focus-within:border-[#39ff14]/20 transition-colors overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 w-8 border-r border-white/5 flex flex-col pt-3">
                                            {body.split("\n").map((_, i) => (
                                                <span
                                                    key={i}
                                                    className="text-right pr-2 font-mono text-[9px] text-white/15 leading-5"
                                                >
                                                    {i + 1}
                                                </span>
                                            ))}
                                        </div>
                                        <textarea
                                            ref={bodyRef}
                                            value={body}
                                            onChange={(e) => setBody(e.target.value)}
                                            rows={Math.min(body.split("\n").length + 1, 12)}
                                            className="w-full bg-transparent pl-10 pr-4 pt-3 pb-3 font-mono text-[11px] text-white/70 outline-none resize-none leading-5"
                                            spellCheck={false}
                                        />
                                    </div>
                                </div>
                            )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {/* Send request (normal) */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={send}
                                disabled={loading}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-5 py-2.5 font-mono text-sm font-semibold transition-all ${loading
                                    ? "border-white/5 bg-white/3 text-white/25 cursor-not-allowed"
                                    : "border-[#39ff14]/30 bg-[#39ff14]/8 text-[#39ff14] hover:bg-[#39ff14]/15 hover:border-[#39ff14]/50 hover:shadow-[0_0_16px_0_rgba(57,255,20,0.15)]"
                                    }`}
                            >
                                {loading ? "Sending..." : <><Play size={13} className="fill-current" /> Send Request</>}
                            </motion.button>

                            {/* Send request (SPAM) */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={spamAttack}
                                disabled={loading}
                                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 font-mono text-sm font-semibold transition-all ${loading
                                    ? "border-white/5 bg-white/3 text-white/25 cursor-not-allowed"
                                    : "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_16px_0_rgba(239,68,68,0.2)]"
                                    }`}
                            >
                                <Zap size={13} className={loading ? "animate-spin" : "fill-current"} />
                                Spam 1000x
                            </motion.button>
                        </div>

                        {/* ── Response panel ── */}
                        <div className="flex-1 flex flex-col min-h-0">
                            {/* Response meta bar */}
                            <div className="flex items-center gap-3 border-b border-white/5 px-5 py-3 flex-wrap gap-y-2">
                                {/* Tabs */}
                                <div className="flex gap-1">
                                    {(["response", "headers", "curl"] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`font-mono text-[10px] px-3 py-1 rounded-lg capitalize transition-colors ${activeTab === tab
                                                ? "bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/20"
                                                : "text-white/30 hover:text-white/60"
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                {response && (
                                    <div className="ml-auto flex items-center gap-3">
                                        {/* Status */}
                                        <span
                                            className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] font-bold ${STATUS_STYLE(response.statusCode)}`}
                                        >
                                            {response.statusCode === 0 ? "ERR" : response.statusCode}
                                        </span>
                                        {/* Latency */}
                                        <span className="flex items-center gap-1 font-mono text-[10px] text-white/30">
                                            <Clock size={9} />
                                            {response.latencyMs}ms
                                        </span>
                                        {/* Size */}
                                        <span className="flex items-center gap-1 font-mono text-[10px] text-white/30">
                                            <Code2 size={9} />
                                            {formatBytes(response.size)}
                                        </span>
                                        {/* Copy */}
                                        <CopyButton text={response.body} />
                                    </div>
                                )}
                            </div>

                            {/* Response body */}
                            <div className="flex-1 overflow-auto p-5 min-h-[240px]">
                                <AnimatePresence mode="wait">
                                    {/* Empty state */}
                                    {!response && !loading && (
                                        <motion.div
                                            key="empty"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="h-full flex flex-col items-center justify-center gap-3 py-16"
                                        >
                                            <Terminal size={28} className="text-white/10" />
                                            <p className="font-mono text-xs text-white/20 text-center">
                                                Select an endpoint and hit{" "}
                                                <span className="text-[#39ff14]/40">Send Request</span>
                                                <br />
                                                to see the live response from your Go API.
                                            </p>
                                        </motion.div>
                                    )}

                                    {/* Loading */}
                                    {loading && (
                                        <motion.div
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="h-full flex flex-col items-center justify-center gap-4 py-16"
                                        >
                                            <div className="relative flex h-10 w-10 items-center justify-center">
                                                <motion.div
                                                    className="absolute inset-0 rounded-full border-2 border-[#39ff14]/20 border-t-[#39ff14]"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                                />
                                                <Zap size={14} className="text-[#39ff14]/60" />
                                            </div>
                                            <p className="font-mono text-[11px] text-white/25">
                                                Awaiting response...
                                            </p>
                                        </motion.div>
                                    )}

                                    {/* Response */}
                                    {response && !loading && (
                                        <motion.div
                                            key="response"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            {/* Error notice */}
                                            {!response.ok && (
                                                <div className="flex items-center gap-2 mb-4 rounded-xl border border-[#f5a623]/15 bg-[#f5a623]/5 px-4 py-2.5">
                                                    <AlertCircle size={12} className="text-[#f5a623] shrink-0" />
                                                    <span className="font-mono text-[11px] text-[#f5a623]/80">
                                                        Request failed — check your API server and CORS settings.
                                                    </span>
                                                </div>
                                            )}

                                            {/* Tab: Response body */}
                                            {activeTab === "response" && (
                                                <pre className="font-mono text-[11px] leading-5 overflow-x-auto">
                                                    {highlightJson(response.body)}
                                                </pre>
                                            )}

                                            {/* Tab: Headers */}
                                            {activeTab === "headers" && (
                                                <div className="space-y-2">
                                                    {Object.keys(response.headers).length === 0 ? (
                                                        <p className="font-mono text-[11px] text-white/25">
                                                            No headers captured.
                                                        </p>
                                                    ) : (
                                                        Object.entries(response.headers).map(([k, v]) => (
                                                            <div key={k} className="flex gap-4 font-mono text-[11px] border-b border-white/3 pb-2">
                                                                <span className="text-[#00acd7] shrink-0 w-40 truncate">{k}</span>
                                                                <span className="text-white/50 break-all">{v}</span>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}

                                            {/* Tab: cURL */}
                                            {activeTab === "curl" && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="font-mono text-[10px] text-white/25 uppercase tracking-widest">
                                                            Generated cURL
                                                        </span>
                                                        <CopyButton text={curlCmd} />
                                                    </div>
                                                    <pre className="font-mono text-[11px] text-[#39ff14]/70 leading-6 whitespace-pre-wrap">
                                                        {curlCmd}
                                                    </pre>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}