export default function RootLoading() {
  return (
    <main className="relative min-h-dvh w-full bg-background text-foreground flex items-center justify-center p-5">
      {/* Centered Terminal Panel Skeleton: max-w-[460px], 28px internal padding (p-7) */}
      <section
        aria-label="Loading Workspace Entry"
        className="relative z-10 w-full max-w-[460px] rounded-2xl border border-border bg-surface/85 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-7 flex flex-col"
      >
        {/* Header: Terminal controls + SGOD.PRO / WORKSPACE */}
        <header className="flex items-center justify-between pb-4 border-b border-border text-[11px] font-mono text-muted tracking-wider uppercase">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-danger/80 shrink-0" />
            <span className="h-2 w-2 rounded-full bg-warning/80 shrink-0" />
            <span className="h-2 w-2 rounded-full bg-success/80 shrink-0" />
          </div>
          <span>SGOD.PRO / WORKSPACE</span>
        </header>

        {/* Small monospace command skeleton */}
        <div className="mt-5 flex items-center gap-1 text-xs font-mono text-command">
          <span className="h-3 w-44 bg-surface-secondary/70 rounded" />
        </div>

        {/* Main heading skeleton (2 lines) */}
        <div className="mt-4 space-y-2">
          <div className="h-7 sm:h-8 w-48 bg-surface-secondary/80 rounded" />
          <div className="h-7 sm:h-8 w-32 bg-surface-secondary/70 rounded" />
        </div>

        {/* Supporting sentence skeleton */}
        <div className="mt-3 h-4 w-60 bg-surface-secondary/50 rounded" />

        {/* Action button skeleton */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-10 w-36 rounded-lg bg-accent/40" />
          <div className="h-3 w-20 bg-surface-secondary/40 rounded" />
        </div>

        {/* Footer links skeleton */}
        <footer className="mt-6 pt-4 border-t border-border/70 flex items-center justify-between text-xs font-mono">
          <div className="h-3 w-20 bg-surface-secondary/40 rounded" />
          <div className="h-3 w-16 bg-surface-secondary/40 rounded" />
        </footer>
      </section>
    </main>
  );
}
