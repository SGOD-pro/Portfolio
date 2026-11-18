export default function SkillsLoading() {
  return (
    <div className="relative flex flex-col grow">
      {/* Terminal Prompt Skeleton */}
      <div className="my-1.5 flex items-center justify-between text-xs font-mono select-none">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[#4ADE80]">souvik@portfolio</span>
          <span className="text-muted/60">:</span>
          <span className="font-semibold text-[#38BDF8]">~</span>
          <span className="text-muted/60">$</span>
          <span className="text-accent font-semibold ml-1">skills</span>
          <span className="text-command ml-1">--all</span>
        </div>
      </div>

      <header className="mt-2 mb-6 animate-pulse">
        <div className="h-8 w-56 bg-surface-secondary/80 rounded" />
        <div className="mt-2 h-4 w-96 max-w-[65ch] bg-surface-secondary/50 rounded" />
      </header>

      {/* Skills Category Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((cat) => (
          <div
            key={cat}
            className="rounded-xl border border-border bg-surface/80 p-5 sm:p-6 space-y-4 animate-pulse"
          >
            <div>
              <div className="h-4 w-40 bg-surface-secondary/80 rounded" />
              <div className="h-3 w-5/6 bg-surface-secondary/50 rounded mt-2" />
            </div>

            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4, 5, 6].map((sk) => (
                <div key={sk} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-20 bg-surface-secondary/60 rounded" />
                    <div className="h-3 w-8 bg-surface-secondary/40 rounded" />
                  </div>
                  <div className="h-1.5 w-full bg-surface-secondary/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-surface-secondary/60 rounded-full"
                      style={{ width: `${60 + (sk * 7) % 35}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
