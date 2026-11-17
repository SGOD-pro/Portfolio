"use client";

const skills = [
  {
    title: "Backend",
    layer: "layer_02",
    accent: "bg-accent",
    tags: ["Node.js", "Go", "Python", "PostgreSQL", "Redis", "MongoDB"],
  },
  {
    title: "Frontend",
    layer: "layer_01",
    accent: "bg-warning",
    tags: ["Next.js", "TS", "Tailwind CSS", "GSAP"],
  },
  {
    title: "AI/ML",
    layer: "neural_net",
    accent: "bg-command",
    tags: ["Scikit-learn", "OpenAI API", "Vector DBs", "LangChain"],
  },
  {
    title: "DevOps",
    layer: "infra_04",
    accent: "bg-danger",
    tags: ["Docker", "Kubernetes", "AWS", "CI/CD"],
  },
];

const metrics = [
  { label: "Optimization", value: "94%", accent: "bg-accent" },
  { label: "Scalability", value: "89%", accent: "bg-warning" },
  { label: "Precision", value: "99.9%", accent: "bg-danger" },
];

function Skills() {
  return (
    <div className="relative flex flex-col grow">
      <div className="my-2 flex items-center gap-2 text-sm font-mono">
        <span className="text-field-placeholder font-bold">souvik@portfolio:~$</span>
        <span className="text-command">skills</span>
        <span className="text-muted text-xs ml-auto hidden sm:inline">
          Analyzing core competencies... <span className="text-accent">[INDEXING COMPLETE]</span>
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 mt-2">
        {skills.map((group) => (
          <section
            key={group.title}
            className="relative rounded-xl border border-segment/70 bg-surface-secondary/60 p-4 shadow-[0_0_0_1px_var(--segment)] lg:col-span-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted">
                <span className="text-accent">▣</span>
                <span className="font-semibold text-foreground">{group.title}</span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted font-mono">
                [{group.layer}]
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {group.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-segment/60 bg-overlay/60 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-accent font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-4 h-1.5 w-full rounded-full bg-overlay/60">
              <div className={`h-1.5 rounded-full ${group.accent}`} style={{ width: "78%" }} />
            </div>
          </section>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-12">
        <div className="relative overflow-hidden rounded-xl border border-segment/70 bg-surface-secondary/60 p-5 shadow-[0_0_0_1px_var(--segment)] lg:col-span-8 flex flex-col justify-end min-h-[160px]">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted font-mono">Architectural Analysis</p>
          <div className="mt-3 rounded-lg border border-segment/60 bg-overlay/30 p-4">
            <h3 className="text-xl font-semibold text-foreground" style={{ fontFamily: "var(--font-plex)" }}>
              Full Stack Mastery
            </h3>
            <p className="mt-1 text-xs text-muted" style={{ fontFamily: "var(--font-sans)" }}>
              Cross-functional expertise in distributed systems and resilient UI frameworks.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-segment/70 bg-surface-secondary/60 p-4 shadow-[0_0_0_1px_var(--segment)] lg:col-span-4 flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted font-mono mb-3">System Load</p>
          <div className="space-y-3">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted font-mono">
                  <span>{metric.label}</span>
                  <span>{metric.value}</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-overlay/60">
                  <div className={`h-1.5 rounded-full ${metric.accent}`} style={{ width: metric.value }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Skills;
