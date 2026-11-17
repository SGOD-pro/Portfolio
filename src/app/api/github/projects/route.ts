import { NextResponse } from "next/server";
import { getProjectsList } from "@/lib/github/api";

export async function GET() {
  try {
    const data = await getProjectsList();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      {
        mode: "empty",
        label: "Featured Projects",
        projects: [],
        fetchedAt: new Date().toISOString(),
        isStale: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
