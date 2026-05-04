"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers } from "lucide-react";

import { Hero } from "@/app/components/Hero";
import { ProjectCard, ProjectCardSkeleton } from "@/app/components/ProjectCard";
import {
  SystemStatusWidget,
  SkillsWidget,
  AvailabilityWidget,
  ActivityLogWidget,
  TelemetryCard,
} from "@/app/components/Widgets";
import { ApiPlayground } from "@/app/components/ApiPlayground";
import { fetchProjects } from "@/lib/api";
import type { Project } from "@/types";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch((err) => {
        console.error("Failed to fetch projects:", err);
        setError("Could not reach API server.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="min-h-screen bg-[#0a0a0a] p-6 md:p-12 font-mono"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(57,255,20,0.05), transparent)",
      }}
    >
      {/* Scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.018]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.06) 2px, rgba(255,255,255,0.06) 4px)",
        }}
      />

      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Hero ── */}
        <Hero />

        {/* ── Top bento row ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AvailabilityWidget />
          <SystemStatusWidget />
          <SkillsWidget />
        </div>

        {/* ── Featured Projects ── */}
        <section>
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center gap-3 mb-4"
          >
            <Layers size={14} className="text-[#39ff14]" />
            <span className="font-mono text-xs font-semibold text-white/70 uppercase tracking-widest">
              Featured Projects
            </span>
            {!loading && !error && (
              <span className="ml-auto font-mono text-[10px] text-white/25">
                {projects.length} project{projects.length !== 1 ? "s" : ""} fetched from API
              </span>
            )}
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && !loading && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 font-mono text-xs text-red-400"
              >
                <span className="text-red-500/60 mr-2">✗</span>
                {error} Projects will appear once the Go server is running.
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => <ProjectCardSkeleton key={i} />)}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && projects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-dashed border-white/5 p-12 text-center"
            >
              <Layers size={24} className="mx-auto mb-3 text-white/10" />
              <p className="font-mono text-xs text-white/25">
                No projects yet. Push your first project to the API.
              </p>
            </motion.div>
          )}

          {/* Cards */}
          {!loading && projects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* ── API Playground ── */}
        <section>
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="flex items-center gap-3 mb-4"
          >
            <span className="font-mono text-xs font-semibold text-white/70 uppercase tracking-widest">
              Live API Playground
            </span>
            <span className="font-mono text-[10px] text-white/20 ml-auto">
              Try your Go API in real-time
            </span>
          </motion.div>
          <ApiPlayground />
        </section>

        {/* ── Bottom row ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActivityLogWidget />
          <TelemetryCard />
        </div>

        {/* ── Footer ── */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex items-center justify-between py-4 border-t border-white/5"
        >
          <span className="font-mono text-[10px] text-white/15">
            aruu.dev · Go + Next.js + PostgreSQL
          </span>
          <span className="font-mono text-[10px] text-[#39ff14]/30">
            © {new Date().getFullYear()}
          </span>
        </motion.footer>
      </div>
    </div>
  );
}