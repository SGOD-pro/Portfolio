"use client";

function Experience() {
  return (
    <div className="relative flex flex-col grow">
      <div className="my-1.5 flex items-center gap-2 text-[11px] font-mono">
        <span className="text-field-placeholder font-bold">souvik@portfolio:~$</span>
        <span className="text-command">experience</span>
      </div>

      <div className="mt-2.5 max-w-3xl rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-success/30 bg-success/15 text-success text-[10px] font-mono uppercase tracking-wider mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <span>Status: Open for Opportunities</span>
        </div>

        <h2 className="text-sm sm:text-base font-bold text-foreground leading-snug tracking-tight font-mono">
          Aspiring Engineer ready to <span className="text-accent">build &amp; scale</span>
        </h2>

        <p className="text-muted text-[11px] sm:text-xs leading-relaxed mt-2.5 font-mono max-w-2xl">
          I am actively seeking entry-level and junior fullstack engineering roles. With a strong foundation in modern web
          architectures, distributed backends, and applied AI workflows, I am eager to contribute to high-impact products
          and collaborate with experienced teams.
        </p>

        <div className="mt-4 pt-4 border-t border-white/10 grid gap-3 sm:grid-cols-3 font-mono text-[11px]">
          <div className="p-2.5 rounded-lg border border-white/10 bg-white/[0.02]">
            <p className="text-muted text-[9px] uppercase tracking-wider">Primary Focus</p>
            <p className="text-foreground font-semibold mt-0.5">Fullstack Web &amp; APIs</p>
          </div>
          <div className="p-2.5 rounded-lg border border-white/10 bg-white/[0.02]">
            <p className="text-muted text-[9px] uppercase tracking-wider">Core Stack</p>
            <p className="text-foreground font-semibold mt-0.5">Next.js, TS, Python, Go</p>
          </div>
          <div className="p-2.5 rounded-lg border border-white/10 bg-white/[0.02]">
            <p className="text-muted text-[9px] uppercase tracking-wider">Availability</p>
            <p className="text-success font-semibold mt-0.5">Immediate / Full-time</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Experience;
