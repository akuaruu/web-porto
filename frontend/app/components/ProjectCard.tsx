"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { Layers, ExternalLink } from "lucide-react";
import type { Project } from "@/types";

// ─── Badge color map ──────────────────────────────────────────────────────────

const TECH_COLORS: Record<string, string> = {
    Go: "bg-[#00acd7]/10 text-[#00acd7]   border-[#00acd7]/30",
    Golang: "bg-[#00acd7]/10 text-[#00acd7]   border-[#00acd7]/30",
    PostgreSQL: "bg-[#336791]/10 text-[#4f9ac4]   border-[#336791]/30",
    Docker: "bg-[#2496ed]/10 text-[#2496ed]   border-[#2496ed]/30",
    Linux: "bg-[#f5a623]/10 text-[#f5a623]   border-[#f5a623]/30",
    "Pop!_OS": "bg-[#48b9c7]/10 text-[#48b9c7]   border-[#48b9c7]/30",
    REST: "bg-[#6db33f]/10 text-[#6db33f]   border-[#6db33f]/30",
    Redis: "bg-[#d82c20]/10 text-[#ff4d4d]   border-[#d82c20]/30",
    Nginx: "bg-[#009900]/10 text-[#00cc00]   border-[#009900]/30",
    Bash: "bg-[#4eaa25]/10 text-[#4eaa25]   border-[#4eaa25]/30",
    Git: "bg-[#f05032]/10 text-[#f05032]   border-[#f05032]/30",
    React: "bg-[#61dafb]/10 text-[#61dafb]   border-[#61dafb]/30",
    TypeScript: "bg-[#3178c6]/10 text-[#3178c6]   border-[#3178c6]/30",
    Next: "bg-white/5     text-white/70     border-white/10",
    "Next.js": "bg-white/5     text-white/70     border-white/10",
    gRPC: "bg-[#244c5a]/10 text-[#4fa3c3]   border-[#244c5a]/30",
    Kubernetes: "bg-[#326ce5]/10 text-[#326ce5]   border-[#326ce5]/30",
};

const DEFAULT_BADGE = "bg-[#39ff14]/10 text-[#39ff14] border-[#39ff14]/30";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function ProjectCardSkeleton() {
    return (
        <motion.div
            className="rounded-2xl border border-white/5 bg-[#111111] p-5 h-44 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <motion.div
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="h-full flex flex-col gap-3"
            >
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-white/5" />
                    <div className="h-3 w-1/3 rounded bg-white/5" />
                </div>
                <div className="h-3 w-full rounded bg-white/5" />
                <div className="h-3 w-4/5 rounded bg-white/5" />
                <div className="flex gap-2 mt-auto">
                    {[12, 16, 10].map((w) => (
                        <div key={w} className={`h-5 w-${w} rounded-full bg-white/5`} />
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface ProjectCardProps {
    project: Project;
    index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{
                duration: 0.55,
                delay: index * 0.09,
                ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ scale: 1.025 }}
            className="group relative rounded-2xl border border-white/5 bg-[#111111] p-5 cursor-pointer overflow-hidden flex flex-col gap-3 transition-shadow duration-300 hover:shadow-[0_0_24px_0_rgba(57,255,20,0.08)] hover:border-[#39ff14]/20"
        >
            {/* Hover glow blob */}
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#39ff14]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#39ff14]/10 border border-[#39ff14]/20">
                        <Layers size={13} className="text-[#39ff14]" />
                    </div>
                    <h3 className="font-mono text-sm font-semibold text-white leading-tight">
                        {project.title}
                    </h3>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    {project.github_url && (
                        <motion.a
                            whileHover={{ scale: 1.15 }}
                            href={project.github_url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-white/20 hover:text-white/60 transition-colors"
                        >
                        </motion.a>
                    )}
                    <motion.div
                        whileHover={{ x: 2, y: -2 }}
                        className="text-white/20 group-hover:text-[#39ff14]/60 transition-colors"
                    >
                        <ExternalLink size={13} />
                    </motion.div>
                </div>
            </div>

            {/* Description */}
            <p className="font-mono text-xs text-white/40 leading-relaxed line-clamp-3">
                {project.description}
            </p>

            {/* Tech badges */}
            <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                {project.tech_stack.map((tech) => (
                    <span
                        key={tech}
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium ${TECH_COLORS[tech] ?? DEFAULT_BADGE
                            }`}
                    >
                        {tech}
                    </span>
                ))}
            </div>
        </motion.div>
    );
}