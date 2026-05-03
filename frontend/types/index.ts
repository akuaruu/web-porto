// DOmain

export interface Project {
    id: string;
    title: string;
    description: string;
    tech_stack: string[];
    is_featured: boolean;
    github_url?: string;
    live_url?: string;
}

export interface ApiResponse<T> {
    status: "success" | "error";
    message?: string;
    data: T;
}

// API Playground

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface EndpointDefinition {
    id: string;
    label: string;
    method: HttpMethod;
    path: string;
    description: string;
    group: string;
    sampleBody?: string;
    params?: Record<string, string>;
}

export interface RequestHistoryEntry {
    id: string;
    method: HttpMethod;
    url: string;
    statusCode: number;
    latencyMs: number;
    timestamp: Date;
    responseSize: number;
}

export interface PlaygroundResponse {
    statusCode: number;
    latencyMs: number;
    body: string;
    headers: Record<string, string>;
    size: number;
    ok: boolean;
}

//System status

export type ServiceStatus = "online" | "degraded" | "offline";

export interface ServiceInfo {
    name: string;
    sub: string;
    status: ServiceStatus;
    latency: string;
}