import type { ApiResponse, Project, PlaygroundResponse, HttpMethod } from "@/types";

const isServer = typeof window === "undefined";

const BASE_URL = isServer
    ? (process.env.API_INTERNAL_URL ?? "http://backend:8080") // Alamat internal Docker
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"); // Alamat dari laptop/browser

// ─── Generic fetch wrapper
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (!res.ok) {
        const errorBody = await res.text()
        throw new Error(`HTTP ${res.status} — ${res.statusText}`);
    }
    return res.json() as Promise<T>;
}

//Domain endpoints 
export async function fetchProjects(): Promise<Project[]> {
    const data = await apiFetch<ApiResponse<Project[]>>("/api/v1/projects");
    return data.data ?? [];
}

// API Playground executor
export async function executePlaygroundRequest(
    method: HttpMethod,
    url: string,
    body?: string,
    customHeaders?: Record<string, string>
): Promise<PlaygroundResponse> {
    const start = performance.now();

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...customHeaders,
    };

    const options: RequestInit = {
        method,
        headers,
        ...(body && method !== "GET" && method !== "DELETE"
            ? { body }
            : {}),
    };

    try {
        const res = await fetch(url, options);
        const latencyMs = Math.round(performance.now() - start);
        const text = await res.text();

        // Try to parse and re-stringify for pretty printing
        let prettyBody = text;
        try {
            prettyBody = JSON.stringify(JSON.parse(text), null, 2);
        } catch {
            // not JSON, keep as-is
        }

        const responseHeaders: Record<string, string> = {};
        res.headers.forEach((value, key) => {
            responseHeaders[key] = value;
        });

        return {
            statusCode: res.status,
            latencyMs,
            body: prettyBody,
            headers: responseHeaders,
            size: new TextEncoder().encode(text).length,
            ok: res.ok,
        };
    } catch (err) {
        const latencyMs = Math.round(performance.now() - start);
        const message =
            err instanceof Error ? err.message : "Unknown network error";

        return {
            statusCode: 0,
            latencyMs,
            body: JSON.stringify({ error: message, hint: "Is the API server running on :8080?" }, null, 2),
            headers: {},
            size: 0,
            ok: false,
        };
    }
}

export { BASE_URL };