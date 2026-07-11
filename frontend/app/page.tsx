import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Cpu,
  GitBranch,
  Link2,
  Mail,
} from "lucide-react";

import { ApiPlayground } from "@/app/components/ApiPlayground";
import { ProfileIntro } from "@/app/components/ProfileIntro";
import { GITHUB_USERNAME, getFeaturedProjects, type FeaturedProject } from "@/lib/projects";

const EMAIL = "ardengoldy.work@gmail.com";
const LINKEDIN_URL = process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "https://www.linkedin.com/in/akuaruu";

function SectionHeader({ title, body }: { title: string; body: string }) {
  return (
    <div className="max-w-3xl">
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-50 md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">{body}</p>
    </div>
  );
}

function TechPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg border border-emerald-300/15 bg-emerald-300/10 px-2.5 py-1 font-mono text-[11px] text-emerald-100/75">
      {children}
    </span>
  );
}

function ProjectCard({ project }: { project: FeaturedProject }) {
  const href = project.live_url ?? project.github_url ?? "#";
  const isExternal = href.startsWith("http");

  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-800 bg-[#0b0d11]/95 transition duration-300 hover:border-emerald-300/25">
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
        className="block"
        aria-label={`Open ${project.title}`}
      >
        <div className="aspect-[16/9] overflow-hidden border-b border-zinc-800 bg-zinc-950">
          <Image
            src={project.preview_url}
            alt={`${project.title} preview`}
            width={1200}
            height={675}
            className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
          />
        </div>
      </a>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] text-zinc-500">
              {project.source === "github" ? "GitHub repository" : "Portfolio project"}
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-zinc-50">
              {project.title}
            </h3>
          </div>
          <a
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer" : undefined}
            className="rounded-xl border border-zinc-800 p-2 text-zinc-500 transition hover:border-emerald-300/30 hover:text-emerald-200"
            aria-label={`Open ${project.title}`}
          >
            <ArrowUpRight size={16} strokeWidth={1.7} />
          </a>
        </div>

        <p className="mt-4 min-h-18 text-sm leading-6 text-zinc-400">{project.description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.tech_stack.slice(0, 5).map((tech) => (
            <TechPill key={tech}>{tech}</TechPill>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3 font-mono text-[11px] text-zinc-500">
          {project.language && <span>{project.language}</span>}
          {typeof project.stars === "number" && <span>{project.stars} stars</span>}
          {project.updatedText && <span>Updated {project.updatedText}</span>}
        </div>
      </div>
    </article>
  );
}

function ChessPreview() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#0b0d11] p-4">
      <div className="mb-3 flex items-center justify-between font-mono text-[11px] text-zinc-500">
        <span>Stockfish WebSocket demo</span>
        <span className="text-emerald-300">live route</span>
      </div>
      <div className="aspect-square overflow-hidden rounded-xl border border-zinc-800 bg-emerald-950/50">
        <Image
          src="/chess-preview.svg"
          alt="Chess engine board preview"
          width={960}
          height={960}
          unoptimized
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

export default async function Home() {
  const projects = await getFeaturedProjects();

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#080a0d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_50%_0%,rgba(110,231,183,0.13),transparent_62%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-20 mb-8 rounded-2xl border border-zinc-800/90 bg-[#080a0d]/82 px-4 py-3 backdrop-blur">
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
              <a className="transition hover:text-zinc-100" href="#about">
                About
              </a>
              <a className="transition hover:text-zinc-100" href="#projects">
                Projects
              </a>
              <a className="transition hover:text-zinc-100" href="#api">
                API
              </a>
              <a className="transition hover:text-zinc-100" href="#chess">
                Chess
              </a>
              <a className="transition hover:text-zinc-100" href="#connect">
                Connect
              </a>
            </div>

            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-200 active:translate-y-px"
            >
              <Mail size={15} strokeWidth={1.8} />
              Contact
            </a>
          </nav>
        </header>

        <ProfileIntro />

        <section id="projects" className="py-16 md:py-24">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              title="Featured projects"
              body="A smaller set of work that is worth opening. Profile-only and learning repos are filtered out."
            />
            <a
              href={`https://github.com/${GITHUB_USERNAME}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-emerald-300/35 hover:text-emerald-100 active:translate-y-px"
            >
              <GitBranch size={16} strokeWidth={1.8} />
              GitHub
            </a>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        <section id="api" className="py-16 md:py-24">
          <SectionHeader
            title="Live API playground"
            body="Run requests from the landing page. The project endpoint uses the same GitHub-backed data as the cards above."
          />
          <div className="mt-10">
            <ApiPlayground compact />
          </div>
        </section>

        <section id="chess" className="py-16 md:py-24">
          <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <ChessPreview />
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/10 text-emerald-200">
                <Cpu size={24} strokeWidth={1.7} />
              </div>
              <h2 className="mt-8 text-3xl font-semibold tracking-tight text-zinc-50 md:text-5xl">
                Chess engine as backend proof
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
                The route demonstrates WebSocket transport, Stockfish process control,
                typed engine telemetry, and frontend recovery when the connection drops.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <TechPill>WebSocket</TechPill>
                <TechPill>Stockfish</TechPill>
                <TechPill>Go process lifecycle</TechPill>
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

        <section id="connect" className="py-16 md:py-24">
          <div className="rounded-2xl border border-zinc-800 bg-[#0b0d11] p-6 md:p-10">
            <SectionHeader
              title="Connect with me"
              body="The fastest way to review my work is GitHub. For direct opportunities, email is the cleanest path."
            />

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <a
                href={`https://github.com/${GITHUB_USERNAME}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 text-zinc-200 transition hover:border-emerald-300/25 hover:text-emerald-100"
              >
                <span className="flex items-center gap-3">
                  <GitBranch size={18} strokeWidth={1.8} />
                  GitHub
                </span>
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 text-zinc-200 transition hover:border-emerald-300/25 hover:text-emerald-100"
              >
                <span className="flex items-center gap-3">
                  <Mail size={18} strokeWidth={1.8} />
                  Email
                </span>
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 text-zinc-200 transition hover:border-emerald-300/25 hover:text-emerald-100"
              >
                <span className="flex items-center gap-3">
                  <Link2 size={18} strokeWidth={1.8} />
                  LinkedIn
                </span>
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </a>
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
