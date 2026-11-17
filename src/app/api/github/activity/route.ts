import { NextResponse } from "next/server";
import { getRecentActivity } from "@/lib/github/api";

export async function GET() {
  try {
    const data = await getRecentActivity();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      {
        activity: [],
        isStale: false,
        fetchedAt: new Date().toISOString(),
        error: message,
      },
      { status: 500 }
    );
  }
}
