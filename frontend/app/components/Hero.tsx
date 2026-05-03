"use client";

import { motion } from "framer-motion";
import { ChevronRight, Clock } from "lucide-react";
import { useTypingEffect } from "@/hooks/useTypingEffect";

const ROLES = [
    "Backend Software Engineer",
    "Golang Developer",
    "API Architect",
    "Linux Enthusiast",
    "Systems Thinker",
];

export function Hero() {
    const typedRole = useTypingEffect(ROLES, 68, 1900);

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-white/5 bg-[#111111] p-8 md:p-12 relative overflow-hidden"
        >
            {/* Background dot grid */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(57,255,20,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.5) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />
            {/* Ambient glows */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#39ff14]/5 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#00acd7]/5 blur-3xl" />

            <div className="relative space-y-5">
                {/* Traffic lights */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-1.5">
                        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                            <div key={c} className="h-3 w-3 rounded-full" style={{ background: c }} />
                        ))}
                    </div>
                    <span className="ml-2 font-mono text-xs text-white/20">
                        aruu@pop-os — zsh — 80×24
                    </span>
                </div>

                {/* Shell prompt */}
                <div className="flex items-center gap-1.5 flex-wrap font-mono text-sm">
                    <span className="text-[#39ff14]">aruu@pop-os</span>
                    <span className="text-white/30">:</span>
                    <span className="text-[#00acd7]">~</span>
                    <span className="text-white/30">$</span>
                    <span className="text-white/50">whoami</span>
                </div>

                {/* Name */}
                <h1 className="font-mono text-5xl md:text-7xl font-bold text-white tracking-tight leading-none">
                    Aruu
                </h1>

                {/* Typing role */}
                <div className="flex items-center gap-2 h-8">
                    <ChevronRight size={14} className="text-[#39ff14] shrink-0" />
                    <span className="font-mono text-lg md:text-xl text-[#39ff14]">
                        {typedRole}
                    </span>
                    <motion.span
                        className="inline-block w-0.5 h-5 bg-[#39ff14]"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                    />
                </div>

                {/* Bio */}
                <p className="font-mono text-sm text-white/35 max-w-xl leading-relaxed">
                    Building high-performance backend systems with Go, PostgreSQL, and
                    Linux. Obsessed with clean APIs, low latency, and systems that scale.
                    Seeking a global backend internship for{" "}
                    <span className="text-[#39ff14]/70">Summer 2026</span>.
                </p>

                {/* CTAs */}
                <div className="flex items-center gap-3 pt-2 flex-wrap">
                    <motion.a
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        href="https://github.com/akuaruu/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs text-white/70 hover:text-white hover:border-white/20 transition-colors"

                    >
                        <svg
                            height="18"
                            width="18"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                        </svg>
                        Github
                    </motion.a>
                    <motion.a
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        href="mailto:ardengoldy.work@gmail.com"
                        className="inline-flex items-center gap-2 rounded-xl border border-[#39ff14]/20 bg-[#39ff14]/5 px-4 py-2 font-mono text-xs text-[#39ff14] hover:bg-[#39ff14]/10 transition-colors"
                    >
                        <Clock size={13} />
                        Available for Hire
                    </motion.a>
                </div>
            </div>
        </motion.header>
    );
}