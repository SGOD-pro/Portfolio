"use client";

import { StaticCodeFallback } from "@/components/StaticCodeFallback";

export default function Loading() {
  return (
    <div className="w-full flex flex-col gap-4 font-mono text-[11px]">
      {/* 3D Code Icon / SVG Fallback */}
      <div className="w-full flex items-center justify-center p-2">
        <StaticCodeFallback color="#D63825" height={220} />
      </div>

      {/* Bio Box Skeleton */}
      <div className="rounded-xl border border-border bg-surface-secondary/20 p-3.5 space-y-2">
        <div className="h-4 w-32 bg-surface-secondary/70 rounded skeleton-shimmer" />
        <div className="space-y-1.5 pt-1">
          <div className="h-3 w-full bg-surface-secondary/50 rounded skeleton-shimmer" />
          <div className="h-3 w-5/6 bg-surface-secondary/40 rounded skeleton-shimmer" />
          <div className="h-3 w-4/5 bg-surface-secondary/40 rounded skeleton-shimmer" />
        </div>
      </div>

      <div role="separator" aria-orientation="horizontal" className="my-1 border-b border-border w-full shrink-0" />

      {/* Telemetry Skeleton */}
      <div className="space-y-2">
        <div className="h-2.5 w-28 bg-surface-secondary/50 rounded skeleton-shimmer" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-10 rounded-lg border border-border bg-surface-secondary/20 p-2 skeleton-shimmer" />
          <div className="h-10 rounded-lg border border-border bg-surface-secondary/20 p-2 skeleton-shimmer" />
        </div>
      </div>

      <div role="separator" aria-orientation="horizontal" className="my-1 border-b border-border w-full shrink-0" />

      {/* Connect Links Skeleton */}
      <div className="space-y-2">
        <div className="h-2.5 w-16 bg-surface-secondary/50 rounded skeleton-shimmer" />
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 rounded-lg border border-border bg-surface-secondary/20 p-2 flex flex-col justify-center gap-1"
            >
              <div className="h-3 w-16 bg-surface-secondary/60 rounded skeleton-shimmer" />
              <div className="h-2.5 w-32 bg-surface-secondary/40 rounded skeleton-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
