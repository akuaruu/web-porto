import { getFeaturedProjects } from "@/lib/projects";

export async function GET() {
  const projects = await getFeaturedProjects();

  return Response.json({
    status: "success",
    message: "Featured projects fetched from GitHub",
    data: projects,
  });
}
