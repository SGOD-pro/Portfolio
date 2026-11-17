import { NextResponse } from "next/server";
import { getProjectsList } from "@/lib/github/api";
import { GitHubApiError } from "@/lib/github/client";

export async function GET() {
  try {
    const data = await getProjectsList();

    const headers: Record<string, string> = {};
    if (data.isStale) {
      // Degraded / stale response: do not apply long-lived public cache
      headers["Cache-Control"] = "no-cache, no-store, max-age=0, must-revalidate";
    } else {
      headers["Cache-Control"] = "public, s-maxage=3600, stale-while-revalidate=7200";
    }

    return NextResponse.json(data, { headers });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    const status = error instanceof GitHubApiError ? error.statusCode : 500;

    return NextResponse.json(
      {
        mode: "empty",
        label: "Featured Projects",
        projects: [],
        fetchedAt: new Date().toISOString(),
        isStale: false,
        error: message,
      },
      {
        status,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
