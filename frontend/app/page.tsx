import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Braces,
  Cable,
  Code2,
  Cpu,
  Database,
  Gauge,
  Mail,
  Network,
  Server,
  Shield,
  Terminal,
} from "lucide-react";

import type { ApiResponse, Project } from "@/types";

const API_BASE_URL =
  process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const fallbackProjects: Project[] = [
  {
    id: "local-api-playground",
    title: "Live API Playground",
    description:
      "A public portfolio surface that sends real requests to a Go backend and shows latency, status, headers, and rate-limit behavior.",
    tech_stack: ["Go", "PostgreSQL", "Docker", "Next.js"],
    github_url: "https://github.com/akuaruu/web_porto",
    live_url: "https://aruu.app",
    is_featured: true,
    created_at: "2026-07-10T00:00:00Z",
    updated_at: "2026-07-10T00:00:00Z",
  },
  {
    id: "local-rate-limit",
    title: "Token Bucket Middleware",
    description:
      "A custom net/http middleware that protects public endpoints and returns a stable API error contract for 429 responses.",
    tech_stack: ["Go", "net/http", "Rate Limit", "Middleware"],
    github_url: "https://github.com/akuaruu/web_porto",
    live_url: null,
    is_featured: true,
    created_at: "2026-07-10T00:00:00Z",
    updated_at: "2026-07-10T00:00:00Z",
  },
  {
    id: "local-chess-engine",
    title: "Chess Engine WebSocket",
    description:
      "A Go WebSocket endpoint that streams Stockfish analysis to a Next.js chess board with live engine telemetry.",
    tech_stack: ["Go", "WebSocket", "Stockfish", "React"],
    github_url: "https://github.com/akuaruu/web_porto",
    live_url: "/chess",
    is_featured: true,
    created_at: "2026-07-10T00:00:00Z",
    updated_at: "2026-07-10T00:00:00Z",
  },
];

const systemProof = [
  {
    icon: Server,
    title: "Go API",
    body: "Standard library router, clean handler/usecase/repository boundaries, and explicit response contracts.",
  },
  {
    icon: Database,
    title: "PostgreSQL",
    body: "Connection pooling through pgx, project persistence, user auth records, and migration-ready schema planning.",
  },
  {
    icon: Shield,
    title: "Middleware",
    body: "CORS, request logging, JWT protection, and token bucket rate limiting built as composable net/http layers.",
  },
  {
    icon: Cable,
    title: "Realtime engine",
    body: "WebSocket session design for Stockfish, typed messages, origin policy, and process lifecycle hardening.",
  },
];

const contractEndpoints = [
  ["GET", "/api/v1/health", "Health and deploy smoke test"],
  ["GET", "/api/v1/projects", "Featured portfolio systems"],
  ["POST", "/api/v1/auth/login", "JWT for protected admin writes"],
  ["GET", "/ws/chess", "WebSocket upgrade for engine stream"],
];

const deploymentFacts = [
  ["Domain", "aruu.app"],
  ["Origin", "134.209.108.221"],
  ["Edge", "Cloudflare proxied"],
  ["Runtime", "Docker Compose"],
];

async function getProjects(): Promise<Project[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/projects?featured=true&limit=6`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return fallbackProjects;

    const payload = (await response.json()) as ApiResponse<Project[]>;
    return payload.data?.length ? payload.data : fallbackProjects;
  } catch {
    return fallbackProjects;
  }
}

function TechPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1 text-[11px] font-medium text-emerald-100/80">
      {children}
    </span>
  );
}

function SectionHeader({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-3xl">
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-50 md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">{body}</p>
    </div>
  );
}

function ProjectSystemCard({ project }: { project: Project }) {
  return (
    <article className="group flex min-h-72 flex-col rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 transition duration-300 hover:border-emerald-300/25 hover:bg-zinc-950">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-300/15 bg-emerald-300/10 text-emerald-200">
          <Network size={20} strokeWidth={1.7} />
        </div>
        {project.live_url && (
          <Link
            href={project.live_url}
            className="rounded-full border border-zinc-800 p-2 text-zinc-500 transition hover:border-emerald-300/30 hover:text-emerald-200"
            aria-label={`Open ${project.title}`}
          >
            <ArrowUpRight size={16} strokeWidth={1.7} />
          </Link>
        )}
      </div>

      <h3 className="mt-8 text-xl font-semibold tracking-tight text-zinc-50">
        {project.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-zinc-400">{project.description}</p>

      <div className="mt-8 flex flex-wrap gap-2">
        {project.tech_stack.slice(0, 5).map((tech) => (
          <TechPill key={tech}>{tech}</TechPill>
        ))}
      </div>
    </article>
  );
}

export default async function Home() {
  const projects = await getProjects();

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#080a0d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_50%_0%,rgba(94,234,170,0.14),transparent_62%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-20 mb-14 rounded-2xl border border-zinc-800/90 bg-[#080a0d]/82 px-4 py-3 backdrop-blur md:mb-20">
          <nav className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-300 text-sm font-bold text-zinc-950">
                A
              </span>
              <span className="hidden text-sm font-medium text-zinc-200 sm:inline">
                Aruu Backend Systems
              </span>
            </Link>

            <div className="hidden items-center gap-6 text-sm text-zinc-400 md:flex">
              <a className="transition hover:text-zinc-100" href="#proof">
                Proof
              </a>
              <a className="transition hover:text-zinc-100" href="#systems">
                Systems
              </a>
              <a className="transition hover:text-zinc-100" href="#api">
                API
              </a>
              <a className="transition hover:text-zinc-100" href="#contact">
                Contact
              </a>
            </div>

            <a
              href="mailto:ardengoldy.work@gmail.com"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-200 active:translate-y-px"
            >
              <Mail size={15} strokeWidth={1.8} />
              Contact
            </a>
          </nav>
        </header>

        <section className="grid min-h-[calc(100dvh-132px)] items-center gap-10 pb-20 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <p className="mb-5 text-sm font-medium text-emerald-200">
              Backend engineer portfolio
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-tight text-zinc-50 md:text-7xl">
              I build the API layer, not just the page around it.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-400">
              This portfolio is a running backend demo: Go services, PostgreSQL,
              middleware, deployment contracts, and realtime engine work.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#api"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-200 active:translate-y-px"
              >
                View API surface
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </a>
              <Link
                href="/chess"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-emerald-300/35 hover:text-emerald-100 active:translate-y-px"
              >
                Open engine demo
                <Cpu size={16} strokeWidth={1.8} />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-3 shadow-2xl shadow-black/40">
              <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                <Image
                  src="/showcase-playground.png"
                  alt="Portfolio API playground showing live backend responses"
                  width={1400}
                  height={920}
                  priority
                  className="h-auto w-full"
                />
              </div>
            </div>

            <div className="absolute -bottom-6 left-5 right-5 rounded-2xl border border-emerald-300/20 bg-[#0c1110]/95 p-4 shadow-xl shadow-black/40 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-zinc-500">Production contract</p>
                  <p className="mt-1 font-mono text-sm text-emerald-100">
                    https://aruu.app/api/v1
                  </p>
                </div>
                <Activity className="text-emerald-200" size={22} strokeWidth={1.7} />
              </div>
            </div>
          </div>
        </section>

        <section id="proof" className="py-12 md:py-20">
          <div className="grid gap-px overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-800 md:grid-cols-4">
            {deploymentFacts.map(([label, value]) => (
              <div key={label} className="bg-[#0b0d11] p-6">
                <p className="text-sm text-zinc-500">{label}</p>
                <p className="mt-2 font-mono text-sm text-zinc-100">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 md:py-24">
          <SectionHeader
            title="The portfolio is the backend proof."
            body="Every visible demo is tied to a backend concern: API shape, middleware behavior, persistence, runtime deployment, and realtime transport."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              {systemProof.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6"
                  >
                    <Icon className="text-emerald-200" size={24} strokeWidth={1.6} />
                    <h3 className="mt-6 text-lg font-semibold text-zinc-50">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">{item.body}</p>
                  </article>
                );
              })}
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-[#0b0d11] p-6">
              <div className="flex items-center gap-3">
                <Terminal className="text-emerald-200" size={22} strokeWidth={1.6} />
                <h3 className="text-lg font-semibold text-zinc-50">
                  What I am optimizing for
                </h3>
              </div>
              <div className="mt-8 space-y-5">
                {[
                  "Clear contracts before implementation",
                  "Small services with explicit failure modes",
                  "Middleware that can be tested without a framework",
                  "Deployment paths that match local development",
                  "Frontend surfaces that reveal backend behavior",
                ].map((item) => (
                  <div key={item} className="flex gap-3 border-t border-zinc-800 pt-5">
                    <Code2
                      className="mt-0.5 shrink-0 text-emerald-200"
                      size={17}
                      strokeWidth={1.7}
                    />
                    <p className="text-sm leading-6 text-zinc-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="systems" className="py-16 md:py-24">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              title="Selected systems"
              body="These are framed as backend systems first. The UI exists to make the services inspectable, not to hide them."
            />
            <a
              href="https://github.com/akuaruu/web_porto"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-emerald-300/35 hover:text-emerald-100"
            >
              <Code2 size={16} strokeWidth={1.8} />
              GitHub repo
            </a>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.slice(0, 6).map((project) => (
              <ProjectSystemCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        <section id="api" className="py-16 md:py-24">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionHeader
                title="Contract-first API surface"
                body="The next backend pass is guided by a documented API contract for REST, WebSocket, Cloudflare, and Droplet deployment."
              />
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/api-lab"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-200 active:translate-y-px"
                >
                  Open API lab
                  <Braces size={16} strokeWidth={1.8} />
                </Link>
                <a
                  href="/api/v1/health"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-emerald-300/35 hover:text-emerald-100 active:translate-y-px"
                >
                  Check health
                  <Gauge size={16} strokeWidth={1.8} />
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4">
              <div className="overflow-hidden rounded-2xl border border-zinc-800">
                <Image
                  src="/showcase-ratelimit.png"
                  alt="Rate limiter demo returning HTTP 429 from the Go backend"
                  width={1400}
                  height={920}
                  className="h-auto w-full"
                />
              </div>
              <div className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800">
                {contractEndpoints.map(([method, path, purpose]) => (
                  <div
                    key={path}
                    className="grid gap-3 bg-[#0b0d11] p-4 sm:grid-cols-[76px_1fr]"
                  >
                    <span className="font-mono text-xs font-semibold text-emerald-200">
                      {method}
                    </span>
                    <div>
                      <p className="font-mono text-sm text-zinc-100">{path}</p>
                      <p className="mt-1 text-sm text-zinc-500">{purpose}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4">
              <div className="overflow-hidden rounded-2xl border border-zinc-800">
                <Image
                  src="/showcase-hero.png"
                  alt="Dark technical portfolio homepage preview"
                  width={1400}
                  height={920}
                  className="h-auto w-full"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/10 text-emerald-200">
                <Cpu size={24} strokeWidth={1.7} />
              </div>
              <h2 className="mt-8 text-3xl font-semibold tracking-tight text-zinc-50 md:text-5xl">
                Realtime work belongs in the portfolio.
              </h2>
              <p className="mt-5 text-base leading-7 text-zinc-400">
                The chess route demonstrates WebSocket transport, engine process
                control, typed telemetry, and failure handling. It is a backend demo
                with an interface attached.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <TechPill>WebSocket</TechPill>
                <TechPill>Stockfish</TechPill>
                <TechPill>Typed messages</TechPill>
              </div>
              <Link
                href="/chess"
                className="mt-9 inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-200 active:translate-y-px"
              >
                Open chess engine
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </Link>
            </div>
          </div>
        </section>

        <section id="contact" className="py-16 md:py-24">
          <div className="rounded-3xl border border-zinc-800 bg-[#0b0d11] p-6 md:p-10">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-end">
              <div>
                <p className="text-sm font-medium text-emerald-200">Available for backend work</p>
                <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-50 md:text-5xl">
                  I am looking for teams where backend quality matters.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
                  Best fit: Go services, API design, Linux deployment, PostgreSQL,
                  observability, and systems that need clear operational thinking.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <a
                  href="mailto:ardengoldy.work@gmail.com"
                  className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 text-zinc-200 transition hover:border-emerald-300/25 hover:text-emerald-100"
                >
                  <span className="flex items-center gap-3">
                    <Mail size={18} strokeWidth={1.8} />
                    Email
                  </span>
                  <ArrowUpRight size={16} strokeWidth={1.8} />
                </a>
                <a
                  href="https://github.com/akuaruu/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 text-zinc-200 transition hover:border-emerald-300/25 hover:text-emerald-100"
                >
                  <span className="flex items-center gap-3">
                    <Code2 size={18} strokeWidth={1.8} />
                    GitHub
                  </span>
                  <ArrowUpRight size={16} strokeWidth={1.8} />
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-4 border-t border-zinc-800 py-8 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
          <span>aruu.app / Go / PostgreSQL / Next.js</span>
          <span>© {new Date().getFullYear()} Aruu</span>
        </footer>
      </div>
    </main>
  );
}
