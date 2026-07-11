"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Clock3,
  Code2,
  Database,
  GitBranch,
  Mail,
  Server,
  Terminal,
} from "lucide-react";

import { useTypingEffect } from "@/hooks/useTypingEffect";

const ROLES = [
  "Backend Engineer",
  "Golang Developer",
  "API Architect",
  "System Analyst",
  "Linux Learner",
];

const STACK_GROUPS = [
  {
    title: "Languages & Frameworks",
    icon: Code2,
    items: ["Go", "Python", "TypeScript", "JavaScript", "Gin", "gRPC"],
  },
  {
    title: "Databases & Infrastructure",
    icon: Database,
    items: ["PostgreSQL", "MySQL", "Redis", "Supabase", "Docker"],
  },
  {
    title: "Tools & Practices",
    icon: Server,
    items: ["Git", "GitHub", "Linux", "Postman", "OpenAPI", "REST API", "JWT"],
  },
  {
    title: "Engineering Habits",
    icon: Activity,
    items: ["Clean Architecture", "Unit Testing", "Database Transactions", "API Documentation"],
  },
];

function StackBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg border border-emerald-300/15 bg-emerald-300/10 px-2.5 py-1 font-mono text-[11px] text-emerald-100/75">
      {children}
    </span>
  );
}

export function ProfileIntro() {
  const typedRole = useTypingEffect(ROLES, 70, 1700);
  const [health, setHealth] = useState<"online" | "degraded" | "offline">("degraded");
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkHealth() {
      try {
        const response = await fetch("/api/v1/health", { headers: { Accept: "application/json" } });
        if (!cancelled) setHealth(response.ok ? "online" : "degraded");
      } catch {
        if (!cancelled) setHealth("offline");
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const updateTime = () => setTime(new Date());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const healthLabel = useMemo(() => {
    if (health === "online") return "API online";
    if (health === "degraded") return "API checking";
    return "API offline";
  }, [health]);

  return (
    <section id="about" className="pt-8 md:pt-12">
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#0b0f0e] p-6 md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(110,231,183,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(110,231,183,0.035)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="relative">
            <div className="mb-5 flex items-center gap-2">
              {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
                <span key={color} className="h-3 w-3 rounded-full" style={{ background: color }} />
              ))}
              <span className="ml-2 font-mono text-xs text-zinc-600">
                aruu@pop-os - zsh - 80x24
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 font-mono text-sm">
              <span className="text-emerald-300">aruu@pop-os</span>
              <span className="text-zinc-600">:</span>
              <span className="text-cyan-300">~</span>
              <span className="text-zinc-600">$</span>
              <span className="text-zinc-400">whoami</span>
            </div>

            <h1 className="mt-7 font-mono text-5xl font-bold leading-none tracking-tight text-zinc-50 md:text-7xl">
              Aruu
            </h1>

            <div className="mt-6 flex h-8 items-center gap-2 font-mono text-lg text-emerald-300 md:text-xl">
              <Terminal size={16} strokeWidth={1.8} />
              <span>{typedRole}</span>
              <span className="h-5 w-0.5 animate-pulse bg-emerald-300" />
            </div>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
              I am an Informatics student focused on backend engineering and system
              analysis. I like turning requirements into maintainable APIs, database
              flows, and production deployment paths.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="https://github.com/akuaruu"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/70 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-emerald-300/35 hover:text-emerald-100 active:translate-y-px"
              >
                <GitBranch size={16} strokeWidth={1.8} />
                GitHub
              </a>
              <a
                href="mailto:ardengoldy.work@gmail.com"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-200 active:translate-y-px"
              >
                <Mail size={16} strokeWidth={1.8} />
                Contact
              </a>
              <Link
                href="#projects"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-emerald-300/35 hover:text-emerald-100 active:translate-y-px"
              >
                Projects
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-[#0b0d11] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
                <Activity size={16} className="text-emerald-300" />
                Runtime
              </div>
              <div className="mt-5 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">Portfolio API</span>
                  <span
                    className={
                      health === "online"
                        ? "text-emerald-300"
                        : health === "offline"
                          ? "text-red-300"
                          : "text-amber-300"
                    }
                  >
                    {healthLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">Local time</span>
                  <span className="text-zinc-200">
                    {time ? time.toLocaleTimeString("en-GB") : "--:--:--"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">Focus</span>
                  <span className="text-zinc-200">Backend Engineering</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#0b0d11] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
                <Clock3 size={16} className="text-emerald-300" />
                Current Track
              </div>
              <div className="mt-5 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">Primary</span>
                  <span className="text-zinc-200">Golang & Py</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">Data</span>
                  <span className="text-zinc-200">PostgreSQL & MySQL</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">System</span>
                  <span className="text-zinc-200">Linux + Docker</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#0b0d11] p-5">
            <h2 className="text-sm font-semibold text-zinc-100">Tech stack and practices</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {STACK_GROUPS.map((group) => {
                const Icon = group.icon;
                return (
                  <div key={group.title}>
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-zinc-300">
                      <Icon size={14} className="text-emerald-300" />
                      {group.title}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <StackBadge key={item}>{item}</StackBadge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
