import { NextRequest, NextResponse } from "next/server";
import { getRepositoryDocument } from "@/lib/github/api";
import { GITHUB_CONFIG } from "@/lib/github/config";
import { GitHubApiError } from "@/lib/github/client";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ repo: string }> }
) {
  try {
    const { repo } = await context.params;
    const owner = GITHUB_CONFIG.username;
    const { searchParams } = new URL(request.url);
    const docPath = searchParams.get("path") || "README.md";

    const data = await getRepositoryDocument(owner, repo, docPath);

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
