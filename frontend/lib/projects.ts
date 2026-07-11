import type { Project } from "@/types";

const GITHUB_USERNAME = process.env.GITHUB_USERNAME ?? "akuaruu";
const API_BASE_URL =
  process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  archived: boolean;
  topics?: string[];
  created_at: string;
  updated_at: string;
};

type ApiResponse<T> = {
  status: "success" | "error";
  message: string;
  data?: T;
};

export type FeaturedProject = Project & {
  source: "github" | "api" | "curated";
  language?: string | null;
  stars?: number;
  updatedText?: string;
  preview_url: string;
  repo_name?: string;
};

export { GITHUB_USERNAME };

const HIDDEN_REPOS = new Set([
  "akuaruu",
  "learning-golang",
  "learning golang",
  "web-porto",
  "web porto",
  "web_porto",
]);

const FEATURED_REPO_PRIORITY = ["apomacy", "url-shortener", "url shortener"];

const curatedProjects: FeaturedProject[] = [
  {
    id: "apomacy",
    title: "Apomacy",
    description:
      "Full-stack pharmacy operations app with a backend-focused folder structure and API integration surface.",
    tech_stack: ["TypeScript", "API Integration", "Database Design"],
    is_featured: true,
    github_url: "https://github.com/akuaruu/Apomacy",
    live_url: null,
    created_at: "2026-07-10T00:00:00Z",
    updated_at: "2026-07-10T00:00:00Z",
    source: "curated",
    language: "TypeScript",
    preview_url: "https://opengraph.githubassets.com/aruu-portfolio/akuaruu/Apomacy",
    repo_name: "Apomacy",
  },
  {
    id: "url-shortener",
    title: "URL Shortener",
    description:
      "Production URL shortener service with Go, Redis caching, PostgreSQL persistence, and a Cloudflare-backed domain.",
    tech_stack: ["Go", "Redis", "PostgreSQL", "Docker"],
    is_featured: true,
    github_url: "https://github.com/akuaruu/url-shortener",
    live_url: "https://url-s.aruu.app",
    created_at: "2026-06-15T00:00:00Z",
    updated_at: "2026-06-15T00:00:00Z",
    source: "curated",
    language: "Go",
    preview_url:
      "https://api.microlink.io/?url=https%3A%2F%2Furl-s.aruu.app&screenshot=true&embed=screenshot.url",
    repo_name: "url-shortener",
  },
];

function normalizedRepoName(name: string) {
  return name.toLowerCase().replaceAll("_", "-").trim();
}

function titleFromRepo(name: string) {
  return name
    .replaceAll("_", "-")
    .split("-")
    .filter(Boolean)
    .map((part) => (part.length <= 3 ? part.toUpperCase() : part[0].toUpperCase() + part.slice(1)))
    .join(" ");
}

function previewForRepo(repo: GitHubRepo) {
  if (repo.homepage?.startsWith("http")) {
    return `https://api.microlink.io/?url=${encodeURIComponent(
      repo.homepage
    )}&screenshot=true&embed=screenshot.url`;
  }

  return `https://opengraph.githubassets.com/aruu-portfolio/${repo.full_name}`;
}

function repoScore(repo: GitHubRepo) {
  const name = normalizedRepoName(repo.name);
  const priorityIndex = FEATURED_REPO_PRIORITY.findIndex((item) => name.includes(item));
  if (priorityIndex >= 0) return 100 - priorityIndex;
  return Math.min(repo.stargazers_count, 20);
}

function repoToProject(repo: GitHubRepo): FeaturedProject {
  const techStack = [
    repo.language,
    ...(repo.topics ?? []).slice(0, 4).map((topic) => topic.replaceAll("-", " ")),
  ].filter(Boolean) as string[];

  return {
    id: String(repo.id),
    title: titleFromRepo(repo.name),
    description:
      repo.description ??
      `Public repository from ${repo.full_name}. Open the source to inspect implementation details.`,
    tech_stack: techStack.length ? techStack : ["GitHub"],
    github_url: repo.html_url,
    live_url: repo.homepage || null,
    is_featured: true,
    created_at: repo.created_at,
    updated_at: repo.updated_at,
    source: "github",
    language: repo.language,
    stars: repo.stargazers_count,
    updatedText: new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(repo.updated_at)),
    preview_url: previewForRepo(repo),
    repo_name: repo.name,
  };
}

export async function getGithubProjects(limit = 4): Promise<FeaturedProject[]> {
  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=20`,
      {
        next: { revalidate: 3600 },
        headers,
      }
    );

    if (!response.ok) return [];

    const repos = (await response.json()) as GitHubRepo[];

    return repos
      .filter((repo) => !repo.fork && !repo.archived)
      .filter((repo) => !HIDDEN_REPOS.has(normalizedRepoName(repo.name)))
      .sort((a, b) => repoScore(b) - repoScore(a))
      .slice(0, limit)
      .map(repoToProject);
  } catch {
    return [];
  }
}

async function getApiProjects(): Promise<FeaturedProject[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/projects?featured=true&limit=4`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return [];

    const payload = (await response.json()) as ApiResponse<Project[]>;
    return (payload.data ?? [])
      .filter((project) => !HIDDEN_REPOS.has(normalizedRepoName(project.title)))
      .map((project) => ({
        ...project,
        source: "api",
        preview_url: "/showcase-playground.png",
      }));
  } catch {
    return [];
  }
}

export async function getFeaturedProjects(limit = 4): Promise<FeaturedProject[]> {
  const githubProjects = await getGithubProjects(limit);
  if (githubProjects.length) return githubProjects;

  const apiProjects = await getApiProjects();
  return apiProjects.length ? apiProjects.slice(0, limit) : curatedProjects.slice(0, limit);
}
