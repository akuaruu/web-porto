"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Activity,
  Server,
  Database,
  Cpu,
  Wifi,
  Globe,
  Code2,
  Terminal,
  Clock,
} from "lucide-react";

// Shared BentoCard wrapper 

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  glow?: boolean;
}

export function BentoCard({
  children,
  className = "",
  delay = 0,
  glow = false,
}: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.015 }}
      className={`relative rounded-2xl border border-white/5 bg-[#111111] overflow-hidden transition-shadow duration-300 ${
        glow
          ? "hover:shadow-[0_0_32px_0_rgba(57,255,20,0.10)] hover:border-[#39ff14]/20"
          : "hover:shadow-[0_0_20px_0_rgba(255,255,255,0.04)] hover:border-white/10"
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ─── PulseDot 

function PulseDot({ delay = 0, color = "#39ff14" }: { delay?: number; color?: string }) {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full opacity-60"
        style={{ background: color }}
        animate={{ scale: [1, 1.9, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2.2, repeat: Infinity, delay, ease: "easeInOut" }}
      />
      <span
        className="relative inline-flex h-2 w-2 rounded-full"
        style={{ background: color }}
      />
    </span>
  );
}

// ─── SystemStatusWidget 

const SERVICES = [
  { name: "API Server",  sub: "Go · :8080",      icon: Server,   color: "#00acd7", delay: 0 },
  { name: "PostgreSQL",  sub: "DB · :5432",       icon: Database, color: "#4f9ac4", delay: 0.4 },
  { name: "Linux Host",  sub: "Pop!_OS 22.04",    icon: Cpu,      color: "#f5a623", delay: 0.8 },
  { name: "Network",     sub: "Outbound OK",      icon: Wifi,     color: "#39ff14", delay: 1.2 },
];

export function SystemStatusWidget() {
  return (
    <BentoCard className="p-5" delay={0.25} glow>
      <div className="mb-4 flex items-center gap-2">
        <Activity size={13} className="text-[#39ff14]" />
        <span className="font-mono text-xs font-semibold text-white/70 uppercase tracking-widest">
          System Status
        </span>
        <motion.span
          className="ml-auto font-mono text-[10px] text-[#39ff14]/60"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ● LIVE
        </motion.span>
      </div>

      <div className="flex flex-col gap-3">
        {SERVICES.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.08, ease: "easeOut" }}
              className="flex items-center gap-3"
            >
              <PulseDot delay={s.delay} color={s.color} />
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Icon size={13} style={{ color: s.color }} />
                <span className="font-mono text-xs text-white/80 truncate">{s.name}</span>
                <span className="font-mono text-[10px] text-white/25 hidden sm:block truncate">
                  · {s.sub}
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#39ff14]/50 shrink-0 tabular-nums">
                online
              </span>
            </motion.div>
          );
        })}
      </div>
    </BentoCard>
  );
}

// ─── SkillsWidget

const SKILLS = [
  { label: "REST API Design", pct: 92 },
  { label: "Golang",          pct: 90 },
  { label: "Linux / Bash",    pct: 85 },
  { label: "PostgreSQL",      pct: 82 },
  { label: "Docker",          pct: 75 },
  { label: "Git",             pct: 88 },
];

export function SkillsWidget() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <BentoCard className="p-5" delay={0.2} glow>
      <div className="mb-4 flex items-center gap-2">
        <Code2 size={13} className="text-[#39ff14]" />
        <span className="font-mono text-xs font-semibold text-white/70 uppercase tracking-widest">
          Core Skills
        </span>
      </div>
      <div ref={ref} className="flex flex-col gap-3">
        {SKILLS.map((skill, i) => (
          <div key={skill.label} className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-white/50">{skill.label}</span>
              <span className="text-[#39ff14]/60">{skill.pct}%</span>
            </div>
            <div className="h-[3px] w-full rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#39ff14]/60 to-[#39ff14]"
                initial={{ width: 0 }}
                animate={inView ? { width: `${skill.pct}%` } : {}}
                transition={{
                  duration: 0.9,
                  delay: 0.4 + i * 0.09,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}

// ─── AvailabilityWidget

export function AvailabilityWidget() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <BentoCard className="p-5" delay={0.15} glow>
      <div className="mb-3 flex items-center gap-2">
        <Globe size={13} className="text-[#39ff14]" />
        <span className="font-mono text-xs font-semibold text-white/70 uppercase tracking-widest">
          Availability
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <PulseDot />
          <span className="font-mono text-xs text-white/80">Open to Opportunities</span>
        </div>

        <div className="rounded-xl bg-[#0a0a0a] border border-white/5 p-3 space-y-2">
          {[
            ["Target Role", "Backend Intern"],
            ["Period",      "Summer 2026"],
            ["Mode",        "Remote / Hybrid"],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between font-mono text-[10px]">
              <span className="text-white/30">{label}</span>
              <span className="text-white/70">{val}</span>
            </div>
          ))}
          <div className="flex justify-between font-mono text-[10px]">
            <span className="text-white/30">Local Time</span>
            <span className="text-[#39ff14]/70 tabular-nums">
              {time ? time.toLocaleTimeString("en-GB") : "--:--:--"}
            </span>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}

// ─── ActivityLogWidget 

const LOGS = [
  { time: "05:41:02", level: "INFO", msg: "Initializing Go runtime..." },
  { time: "05:41:02", level: "INFO", msg: "Loading environment variables" },
  { time: "05:41:03", level: "INFO", msg: "Connecting to PostgreSQL @ :5432" },
  { time: "05:41:03", level: "OK  ", msg: "Database connection established" },
  { time: "05:41:03", level: "INFO", msg: "Registering API routes v1" },
  { time: "05:41:04", level: "OK  ", msg: "Server listening on :8080" },
  { time: "05:41:04", level: "INFO", msg: "CORS policy applied" },
  { time: "05:41:09", level: "GET ", msg: "/api/v1/projects → 200 (4ms)" },
];

const LEVEL_COLOR: Record<string, string> = {
  "OK  ": "text-[#39ff14]",
  INFO:   "text-[#00acd7]",
  "GET ": "text-[#f5a623]",
  WARN:   "text-yellow-400",
  ERR:    "text-red-400",
};

export function ActivityLogWidget() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= LOGS.length) return;
    const t = setTimeout(() => setVisibleCount((n) => n + 1), 300);
    return () => clearTimeout(t);
  }, [visibleCount]);

  return (
    <BentoCard className="p-5 flex flex-col" delay={0.3}>
      <div className="mb-3 flex items-center gap-2">
        <Terminal size={13} className="text-[#39ff14]" />
        <span className="font-mono text-xs font-semibold text-white/70 uppercase tracking-widest">
          Server Logs
        </span>
        <div className="ml-auto flex gap-1">
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-hidden">
        <AnimatePresence>
          {LOGS.slice(0, visibleCount).map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex gap-2 font-mono text-[10px] leading-5"
            >
              <span className="text-white/20 shrink-0">{log.time}</span>
              <span className={`shrink-0 w-8 ${LEVEL_COLOR[log.level] ?? "text-white/40"}`}>
                {log.level.trim()}
              </span>
              <span className="text-white/50 truncate">{log.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {visibleCount >= LOGS.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 font-mono text-[10px] leading-5"
          >
            <span className="text-white/20">{new Date().toLocaleTimeString("en-GB")}</span>
            <span className="text-[#39ff14] shrink-0">›</span>
            <motion.span
              className="inline-block w-1.5 h-3 bg-[#39ff14] align-middle"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        )}
      </div>
    </BentoCard>
  );
}

// ─── PhilosophyCard 

const PHILOSOPHY_LINES = [
  { cmd: "$ cat philosophy.md",  out: "Build systems that are boring to operate and exciting to develop." },
  { cmd: "$ echo $STACK",        out: "Go · PostgreSQL · Docker · Linux · REST" },
  { cmd: "$ uptime",             out: "Consistently curious. Always shipping." },
];

export function PhilosophyCard() {
  return (
    <BentoCard className="p-5" delay={0.35}>
      <div className="mb-4 flex items-center gap-2">
        <Terminal size={13} className="text-[#39ff14]" />
        <span className="font-mono text-xs font-semibold text-white/70 uppercase tracking-widest">
          Philosophy
        </span>
      </div>

      <div className="space-y-4">
        {PHILOSOPHY_LINES.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.12, ease: "easeOut" }}
            className="space-y-0.5"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[#39ff14] text-[10px]">›</span>
              <span className="font-mono text-[10px] text-[#00acd7]">{item.cmd}</span>
            </div>
            <p className="font-mono text-[11px] text-white/40 pl-3 leading-relaxed">
              {item.out}
            </p>
          </motion.div>
        ))}
      </div>
    </BentoCard>
  );
}