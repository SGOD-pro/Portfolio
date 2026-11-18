export default function ProjectsLoading() {
  return (
    <div className="flex flex-col grow">
      {/* Terminal Prompt Skeleton */}
      <div className="my-1.5 flex items-center justify-between text-xs font-mono select-none">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[#4ADE80]">souvik@portfolio</span>
          <span className="text-muted/60">:</span>
          <span className="font-semibold text-[#38BDF8]">~</span>
          <span className="text-muted/60">$</span>
          <span className="text-accent font-semibold ml-1">projects</span>
          <span className="text-command ml-1">--all</span>
        </div>
      </div>

      <header className="mt-2 mb-6 animate-pulse">
        <div className="h-8 w-44 bg-surface-secondary/80 rounded" />
        <div className="mt-2 h-4 w-80 max-w-[65ch] bg-surface-secondary/50 rounded" />
      </header>

      {/* Project Cards Grid Skeleton */}
      <div className="grid gap-4 lg:grid-cols-2">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="h-44 rounded-xl border border-border bg-surface/80 p-5 flex flex-col justify-between animate-pulse"
          >
            <div>
              <div className="flex items-center justify-between gap-2 pb-2">
                <div className="h-3 w-36 bg-surface-secondary/70 rounded" />
                <div className="h-3 w-16 bg-surface-secondary/50 rounded" />
              </div>
              <div className="h-4 w-48 bg-surface-secondary/80 rounded mt-1" />
              <div className="space-y-1.5 mt-2.5">
                <div className="h-3 w-full bg-surface-secondary/50 rounded" />
                <div className="h-3 w-5/6 bg-surface-secondary/40 rounded" />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <div className="h-4 w-14 bg-surface-secondary/50 rounded-full" />
              <div className="h-4 w-12 bg-surface-secondary/40 rounded-full" />
              <div className="h-4 w-16 bg-surface-secondary/40 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
