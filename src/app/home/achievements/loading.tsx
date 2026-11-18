export default function AchievementsLoading() {
  return (
    <div className="relative flex flex-col grow">
      {/* Terminal prompt skeleton */}
      <div className="my-1.5 flex items-center justify-between text-xs font-mono select-none">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[#4ADE80]">souvik@portfolio</span>
          <span className="text-muted/60">:</span>
          <span className="font-semibold text-[#38BDF8]">~</span>
          <span className="text-muted/60">$</span>
          <span className="text-accent font-semibold ml-1">achievements</span>
          <span className="text-command ml-1">--certificates</span>
        </div>
      </div>

      <header className="mt-2 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-surface-secondary/80 rounded" />
            <div className="mt-2 h-4 w-96 max-w-[65ch] bg-surface-secondary/50 rounded" />
          </div>

          <div className="flex items-center gap-2 animate-pulse">
            <div className="h-8 w-36 bg-surface-secondary/50 rounded-lg" />
            <div className="flex items-center gap-1">
              <div className="h-7 w-16 bg-surface-secondary/50 rounded-lg" />
              <div className="h-7 w-24 bg-surface-secondary/50 rounded-lg" />
              <div className="h-7 w-20 bg-surface-secondary/50 rounded-lg" />
            </div>
          </div>
        </div>
      </header>

      {/* 4 Stat Badges Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-surface/60 p-3 font-mono space-y-1.5 animate-pulse"
          >
            <div className="h-2.5 w-20 bg-surface-secondary/50 rounded" />
            <div className="h-6 w-16 bg-surface-secondary/80 rounded" />
            <div className="h-2.5 w-24 bg-surface-secondary/40 rounded" />
          </div>
        ))}
      </div>

      {/* Certificates Section Skeleton */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
          <div className="h-2 w-2 rounded-full bg-command/60" />
          <div className="h-3 w-56 bg-surface-secondary/70 rounded" />
          <div className="ml-auto h-2.5 w-24 bg-surface-secondary/40 rounded" />
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="rounded-xl border border-border bg-surface/80 p-4 sm:p-5 space-y-3 animate-pulse"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <div className="h-3.5 w-24 bg-surface-secondary/60 rounded" />
                <div className="h-3 w-16 bg-surface-secondary/40 rounded" />
              </div>
              <div className="h-4 w-4/5 bg-surface-secondary/80 rounded" />
              <div className="h-3 w-3/5 bg-surface-secondary/50 rounded" />
              <div className="space-y-1 pt-1">
                <div className="h-3 w-full bg-surface-secondary/40 rounded" />
                <div className="h-3 w-4/5 bg-surface-secondary/30 rounded" />
              </div>
              <div className="flex items-center gap-1.5 pt-2">
                <div className="h-4 w-20 bg-surface-secondary/40 rounded-full" />
                <div className="h-4 w-24 bg-surface-secondary/40 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
