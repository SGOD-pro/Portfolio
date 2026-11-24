export default function ExperienceLoading() {
  return (
    <div className="relative flex flex-col grow">
      {/* Terminal Prompt Skeleton */}
      <div className="my-1.5 flex items-center justify-between text-xs font-mono select-none">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[#4ADE80]">souvik@portfolio</span>
          <span className="text-muted/60">:</span>
          <span className="font-semibold text-[#38BDF8]">~</span>
          <span className="text-muted/60">$</span>
          <span className="text-accent font-semibold ml-1">experience</span>
        </div>
      </div>

      <header className="mt-2 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="h-8 w-36 bg-surface-secondary/80 rounded skeleton-shimmer" />
            <div className="mt-2 h-4 w-80 max-w-[65ch] bg-surface-secondary/50 rounded skeleton-shimmer" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-success/30 bg-success/10 text-success text-xs font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-success/80" />
            <span className="h-3 w-36 bg-success/20 rounded skeleton-shimmer" />
          </div>
        </div>
      </header>

      {/* Focus Cards Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-surface/80 p-5 sm:p-6 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="h-5 w-48 sm:w-56 bg-surface-secondary/80 rounded skeleton-shimmer" />
              <div className="h-4 w-28 bg-surface-secondary/50 rounded skeleton-shimmer" />
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="h-3.5 w-full bg-surface-secondary/50 rounded skeleton-shimmer" />
              <div className="h-3.5 w-11/12 bg-surface-secondary/40 rounded skeleton-shimmer" />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
              <div className="h-5 w-36 bg-surface-secondary/40 rounded skeleton-shimmer" />
              <div className="h-5 w-40 bg-surface-secondary/40 rounded skeleton-shimmer" />
              <div className="h-5 w-32 bg-surface-secondary/30 rounded skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
