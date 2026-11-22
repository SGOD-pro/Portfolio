import { NextRequest, NextResponse } from "next/server";
import { getRepositoryDetails, getRepositoryLanguages, getProjectsList } from "@/lib/github/api";
import { GITHUB_CONFIG } from "@/lib/github/config";
import { GitHubApiError } from "@/lib/github/client";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ repo: string }> }
) {
  try {
    const { repo } = await context.params;
    const { searchParams } = new URL(request.url);

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

    const [details, languages] = await Promise.all([
      getRepositoryDetails(owner, repo),
      getRepositoryLanguages(owner, repo).catch(() => ({
        languages: {},
        isStale: false,
        fetchedAt: new Date().toISOString(),
      })),
    ]);

    return NextResponse.json(
      {
        repo: details.repo,
        languages: languages.languages,
        isStale: details.isStale,
        fetchedAt: details.fetchedAt,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error: unknown) {
    const status = error instanceof GitHubApiError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status });
  }
}
