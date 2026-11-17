"use client";

const projects = [
  {
    name: "AI-Ops Platform",
    key: "node_distributed_monitor",
    description:
      "Distributed monitoring with real-time analysis. Integrated neural networks for predictive maintenance and cluster health optimization.",
    tags: ["Kubernetes", "PyTorch", "Golang"],
    status: "deployed",
  },
  {
    name: "VectorSearch Engine",
    key: "semantic_core",
    description:
      "High-performance semantic search implementation with sub-millisecond latency for billion-scale datasets.",
    tags: ["Rust", "C++"],
    status: "active",
  },
  {
    name: "SynthUI",
    key: "ui_adaptive_system",
    description:
      "Component library for generative interfaces. Automatically adapts layout structures based on real-time LLM feedback loops and user behavior analytics.",
    tags: ["React", "TypeScript", "LLM"],
    status: "stable",
    meta: "v2.4.0-stable · 0-errors",
  },
];

const statusAccent: Record<string, string> = {
  deployed: "bg-success/20 text-success border border-success/30",
  active: "bg-warning/20 text-warning border border-warning/30",
  stable: "bg-accent/20 text-accent border border-accent/30",
};

function Projects() {
  return (
    <div className="relative flex flex-col grow">
      <div className="my-2 flex items-center gap-2 text-sm font-mono">
        <span className="text-field-placeholder font-bold">souvik@portfolio:~$</span>
        <span className="text-command">projects</span>
        <span className="text-muted text-xs ml-auto hidden sm:inline">
          Fetching deployed systems from GitHub... <span className="text-success font-semibold">[connected]</span>
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-12 mt-2">
        {projects.map((project, index) => (
          <article
            key={project.key}
            className={`group relative rounded-xl border border-segment/70 bg-surface-secondary/60 p-4 sm:p-5 shadow-[0_0_0_1px_var(--segment)] transition hover:border-foreground/60 hover:bg-surface-secondary/80 flex flex-col justify-between ${
              index === 0 ? "lg:col-span-7" : index === 1 ? "lg:col-span-5" : "lg:col-span-12"
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted font-mono">{project.key}</p>
                  <h2
                    className="mt-1 text-xl sm:text-2xl font-bold text-foreground"
                    style={{ fontFamily: "var(--font-plex)" }}
                  >
                    {project.name}
                  </h2>
                </div>
                <button
                  type="button"
                  className="rounded-md border border-segment/70 bg-overlay/60 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-segment transition group-hover:border-foreground/70 group-hover:text-accent font-mono cursor-pointer"
                >
                  Details
                </button>
              </div>

              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted" style={{ fontFamily: "var(--font-sans)" }}>
                {project.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-segment/40">
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-segment/60 bg-overlay/50 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-accent font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] font-mono ${statusAccent[project.status]}`}>
                  {project.status}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted font-mono">
                  {project.meta ?? "system: active"}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Projects;
