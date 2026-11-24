export default function HomeLoading() {
  return (
    <div className="relative flex flex-col grow">
      {/* Terminal Prompt Skeleton */}
      <div className="my-1.5 flex items-center justify-between text-xs font-mono select-none">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[#4ADE80]">souvik@portfolio</span>
          <span className="text-muted/60">:</span>
          <span className="font-semibold text-[#38BDF8]">~</span>
          <span className="text-muted/60">$</span>
          <span className="text-accent font-semibold ml-1">whoami</span>
        </div>
      </div>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-12 grow items-start mt-2">
        {/* Left Column: Hero & Narrative Skeleton */}
        <section className="lg:col-span-7 flex flex-col">
          <div className="h-9 sm:h-11 lg:h-12 w-64 sm:w-72 bg-surface-secondary/80 rounded skeleton-shimmer" />
          <div className="mt-2 h-4 w-72 sm:w-80 bg-surface-secondary/50 rounded skeleton-shimmer" />

          <div className="mt-4 space-y-2.5 max-w-[62ch]">
            <div className="h-3.5 w-full bg-surface-secondary/50 rounded skeleton-shimmer" />
            <div className="h-3.5 w-11/12 bg-surface-secondary/40 rounded skeleton-shimmer" />
            <div className="h-3.5 w-4/5 bg-surface-secondary/40 rounded skeleton-shimmer" />
            <div className="h-3.5 w-full bg-surface-secondary/40 rounded mt-3 skeleton-shimmer" />
            <div className="h-3.5 w-3/4 bg-surface-secondary/30 rounded skeleton-shimmer" />
          </div>

          {/* Action Buttons Skeleton */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="h-9 w-36 rounded-lg bg-accent/40 skeleton-shimmer" />
            <div className="h-9 w-28 rounded-lg border border-border bg-surface-secondary/40 skeleton-shimmer" />
          </div>
        </section>

        {/* Right Column: Public Engineering Activity Skeleton */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-surface/80 p-4 sm:p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs uppercase tracking-wider text-muted font-sans font-semibold">
                Recent Public Activity
              </span>
              <span className="text-[10px] text-muted font-mono">
                github.com/SGOD-pro
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1.5 rounded-lg border border-border bg-surface-secondary/20 p-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-32 bg-surface-secondary/80 rounded skeleton-shimmer" />
                    <div className="h-2.5 w-16 bg-surface-secondary/60 rounded skeleton-shimmer" />
                  </div>
                  <div className="h-2.5 w-24 bg-surface-secondary/40 rounded skeleton-shimmer" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
