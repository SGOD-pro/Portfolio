"use client";

function Experience() {
  return (
    <div className="relative flex flex-col grow justify-center max-w-3xl mx-auto py-6">
      <div className="mb-4 flex items-center gap-2 text-sm font-mono">
        <span className="text-field-placeholder font-bold">souvik@portfolio:~$</span>
        <span className="text-command">experience</span>
      </div>

      <div className="rounded-xl border border-segment/70 bg-surface-secondary/60 p-6 sm:p-8 shadow-[0_0_0_1px_var(--segment)]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-success/30 bg-success/15 text-success text-xs font-mono uppercase tracking-wider mb-4">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span>Status: Open for Opportunities</span>
        </div>

        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight"
          style={{ fontFamily: "var(--font-plex)" }}
        >
          Aspiring Engineer ready to <span className="text-accent">build &amp; scale</span>
        </h2>

        <p className="text-muted text-sm sm:text-base leading-relaxed mt-4" style={{ fontFamily: "var(--font-sans)" }}>
          I am actively seeking entry-level and junior fullstack engineering roles. With a strong foundation in modern web
          architectures, distributed backends, and applied AI workflows, I am eager to contribute to high-impact products
          and collaborate with experienced teams.
        </p>

        <div className="mt-6 pt-6 border-t border-segment/40 grid gap-4 sm:grid-cols-3 font-mono text-xs">
          <div className="p-3 rounded-lg border border-segment/50 bg-overlay/40">
            <p className="text-muted text-[10px] uppercase tracking-widest">Primary Focus</p>
            <p className="text-foreground font-semibold mt-1">Fullstack Web &amp; APIs</p>
          </div>
          <div className="p-3 rounded-lg border border-segment/50 bg-overlay/40">
            <p className="text-muted text-[10px] uppercase tracking-widest">Core Stack</p>
            <p className="text-foreground font-semibold mt-1">Next.js, TS, Python, Go</p>
          </div>
          <div className="p-3 rounded-lg border border-segment/50 bg-overlay/40">
            <p className="text-muted text-[10px] uppercase tracking-widest">Availability</p>
            <p className="text-success font-semibold mt-1">Immediate / Full-time</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Experience;
