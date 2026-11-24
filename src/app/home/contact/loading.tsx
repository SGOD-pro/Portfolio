export default function ContactLoading() {
  return (
    <div className="relative flex flex-col grow">
      {/* Linux prompt skeleton */}
      <div className="my-1.5 flex items-center justify-between text-xs font-mono select-none">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[#4ADE80]">souvik@portfolio</span>
          <span className="text-muted/60">:</span>
          <span className="font-semibold text-[#38BDF8]">~</span>
          <span className="text-muted/60">$</span>
          <span className="text-accent font-semibold ml-1">contact</span>
        </div>
      </div>

      <header className="mt-1.5 mb-3">
        <div className="h-8 w-32 bg-surface-secondary/80 rounded skeleton-shimmer" />
        <div className="mt-1.5 h-4 w-96 max-w-[65ch] bg-surface-secondary/50 rounded skeleton-shimmer" />
      </header>

      <div className="grid gap-4 lg:grid-cols-12 grow items-start">
        {/* Contact Form Section Skeleton */}
        <section className="lg:col-span-7 rounded-xl border border-border bg-surface/80 p-4 sm:p-5 space-y-4">
          <div className="h-5 w-36 bg-surface-secondary/80 rounded skeleton-shimmer" />

          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <div className="h-3 w-16 bg-surface-secondary/60 rounded skeleton-shimmer" />
                <div className="h-9 w-full rounded-lg border border-border bg-surface-secondary/30 skeleton-shimmer" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-20 bg-surface-secondary/60 rounded skeleton-shimmer" />
                <div className="h-9 w-full rounded-lg border border-border bg-surface-secondary/30 skeleton-shimmer" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="h-3 w-14 bg-surface-secondary/60 rounded skeleton-shimmer" />
              <div className="h-9 w-full rounded-lg border border-border bg-surface-secondary/30 skeleton-shimmer" />
            </div>

            <div className="space-y-1.5">
              <div className="h-3 w-16 bg-surface-secondary/60 rounded skeleton-shimmer" />
              <div className="h-20 w-full rounded-lg border border-border bg-surface-secondary/30 skeleton-shimmer" />
            </div>

            <div className="h-9 w-32 rounded-lg bg-accent/40 mt-1 skeleton-shimmer" />
          </div>
        </section>

        {/* Direct Channels Section Skeleton */}
        <section className="lg:col-span-5 flex flex-col gap-3">
          <div className="rounded-xl border border-border bg-surface/80 p-4 sm:p-5 space-y-3">
            <div className="h-4 w-32 bg-surface-secondary/80 rounded skeleton-shimmer" />
            <div className="h-3.5 w-full bg-surface-secondary/50 rounded skeleton-shimmer" />

            <div className="h-10 w-full rounded-lg border border-border bg-surface-secondary/40 skeleton-shimmer" />

            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="h-9 w-full rounded-lg border border-border bg-surface-secondary/30 skeleton-shimmer" />
              <div className="h-9 w-full rounded-lg border border-border bg-surface-secondary/30 skeleton-shimmer" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface/60 p-3.5 space-y-1.5">
            <div className="h-3 w-28 bg-surface-secondary/60 rounded skeleton-shimmer" />
            <div className="h-3 w-48 bg-surface-secondary/40 rounded skeleton-shimmer" />
          </div>
        </section>
      </div>
    </div>
  );
}
