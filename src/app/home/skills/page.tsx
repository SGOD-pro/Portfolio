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
      <div className="my-1.5 flex items-center gap-2 text-[11px] font-mono">
        <span className="text-field-placeholder font-bold">souvik@portfolio:~$</span>
        <span className="text-command">skills</span>
        <span className="text-muted text-[10px] ml-auto hidden sm:inline">
          Analyzing core competencies... <span className="text-accent">[INDEXING COMPLETE]</span>
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12 mt-2">
        {skills.map((group) => (
          <section
            key={group.title}
            className="relative rounded-xl border border-white/10 bg-white/[0.03] p-3.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] lg:col-span-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted font-mono">
                <span className="text-accent">▣</span>
                <span className="font-semibold text-foreground">{group.title}</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted font-mono">
                [{group.layer}]
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {group.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] tracking-wide text-accent font-mono font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-3.5 h-1 w-full rounded-full bg-white/10">
              <div className={`h-1 rounded-full ${group.accent}`} style={{ width: "78%" }} />
            </div>
          </section>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-12">
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] lg:col-span-8 flex flex-col justify-end min-h-[140px]">
          <p className="text-[10px] uppercase tracking-wider text-muted font-mono font-medium">Architectural Analysis</p>
          <div className="mt-2.5 rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <h3 className="text-xs sm:text-sm font-semibold tracking-tight text-foreground font-mono">
              Full Stack Architecture
            </h3>
            <p className="mt-1 text-xs text-muted font-mono leading-relaxed">
              Cross-functional expertise in distributed systems, resilient API backends, and modern client interfaces.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] lg:col-span-4 flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-wider text-muted font-mono font-medium mb-2.5">System Focus</p>
          <div className="space-y-2.5">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <div className="flex items-center justify-between text-xs tracking-wider text-muted font-mono">
                  <span>{metric.label}</span>
                  <span className="font-semibold text-foreground">{metric.value}</span>
                </div>
                <div className="mt-1 h-1 w-full rounded-full bg-white/10">
                  <div className={`h-1 rounded-full ${metric.accent}`} style={{ width: metric.value }} />
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
