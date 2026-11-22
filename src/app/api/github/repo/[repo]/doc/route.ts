import { NextRequest, NextResponse } from "next/server";
import { getRepositoryDocument, getArchitectureDocument, getProjectsList } from "@/lib/github/api";
import { GITHUB_CONFIG } from "@/lib/github/config";
import { GitHubApiError } from "@/lib/github/client";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ repo: string }> }
) {
  try {
    const { repo } = await context.params;
    const { searchParams } = new URL(request.url);
    const docPath = searchParams.get("path") || "README.md";

    let owner = searchParams.get("owner");
    if (!owner) {
      try {
        const list = await getProjectsList();
        const found = list.projects.find((p) => p.name.toLowerCase() === repo.toLowerCase());
        if (found && found.fullName?.includes("/")) {
          owner = found.fullName.split("/")[0];
        }
      } catch {
        // Fall back to default
      }
      if (!owner) {
        owner = GITHUB_CONFIG.username;
      }
    }

    const data =
      docPath.toLowerCase() === "architecture" || docPath.toLowerCase() === "architecture.md"
        ? await getArchitectureDocument(owner, repo)
        : await getRepositoryDocument(owner, repo, docPath);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error: unknown) {
    const status = error instanceof GitHubApiError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status });
  }
}
