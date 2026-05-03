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
                        href="https://github.com"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs text-white/70 hover:text-white hover:border-white/20 transition-colors"
                    >
                    </motion.a>
                    <motion.a
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        href="mailto:aruu@example.com"
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