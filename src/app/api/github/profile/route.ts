import { NextResponse } from "next/server";
import { getPublicProfile } from "@/lib/github/api";
import { GitHubApiError } from "@/lib/github/client";

export async function GET() {
  try {
    const data = await getPublicProfile();
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
