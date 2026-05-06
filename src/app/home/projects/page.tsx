import { Separator } from '@heroui/react'

const projects = [
  {
    name: 'AI-Ops Platform',
    key: 'node_distributed_monitor',
    description:
      'Distributed monitoring with real-time analysis. Integrated neural networks for predictive maintenance and cluster health optimization.',
    tags: ['Kubernetes', 'PyTorch', 'Golang'],
    status: 'deployed',
  },
  {
    name: 'VectorSearch Engine',
    key: 'semantic_core',
    description:
      'High-performance semantic search implementation with sub-millisecond latency for billion-scale datasets.',
    tags: ['Rust', 'C++'],
    status: 'active',
  },
  {
    name: 'SynthUI',
    key: 'ui_adaptive_system',
    description:
      'Component library for generative interfaces. Automatically adapts layout structures based on real-time LLM feedback loops and user behavior analytics.',
    tags: ['React', 'TypeScript', 'LLM'],
    status: 'stable',
    meta: 'v2.4.0-stable · 0-errors',
  },
]

const statusAccent: Record<string, string> = {
  deployed: 'bg-success/20 text-success',
  active: 'bg-warning/20 text-warning',
  stable: 'bg-accent/20 text-accent',
}

function Projects() {
  return (
    <div className="projects-shell relative h-full overflow-hidden rounded-xl border border-segment bg-surface/80 shadow-[0_0_0_1px_var(--segment)]">
      <div className="projects-grid absolute inset-0" />
      <div className="relative flex h-full flex-col px-6 py-5">
        <header className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-danger" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning" />
            <span className="h-2.5 w-2.5 rounded-full bg-success" />
          </div>
          <span className="ml-2 rounded-md border border-segment/60 bg-overlay/60 px-2 py-1 text-[10px] uppercase tracking-[0.35em] text-segment">
            portfolio
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted">~</span>
          <span className="text-[10px] uppercase tracking-[0.35em] text-segment">projects</span>
          <span className="ml-auto rounded-md border border-segment/60 bg-overlay/60 px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-segment">
            ssh · 127.0.0.1
          </span>
        </header>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted">
            <span className="text-accent">@</span>
            <span>Fetching deployed systems from GitHub...</span>
            <span className="rounded-full bg-success/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-success">
              connected
            </span>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid gap-5 lg:grid-cols-12">
          {projects.map((project, index) => (
            <article
              key={project.key}
              className={`group relative rounded-xl border border-segment/70 bg-surface-secondary/60 p-5 shadow-[0_0_0_1px_var(--segment)] transition hover:border-foreground/60 hover:bg-surface-secondary/80 ${
                index === 0 ? 'lg:col-span-7' : index === 1 ? 'lg:col-span-5' : 'lg:col-span-12'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted">{project.key}</p>
                  <h2
                    className="mt-2 text-2xl font-bold text-foreground"
                    style={{ fontFamily: 'var(--font-plex)' }}
                  >
                    {project.name}
                  </h2>
                </div>
                <button className="rounded-md border border-segment/70 bg-overlay/60 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-segment transition group-hover:border-foreground/70 group-hover:text-foreground">
                  Details
                </button>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-muted" style={{ fontFamily: 'var(--font-sans)' }}>
                {project.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-segment/60 bg-overlay/60 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-segment"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
                <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] ${statusAccent[project.status]}`}>
                  {project.status}
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-segment">
                  {project.meta ?? 'system: all_services_operational'}
                </span>
              </div>
            </article>
          ))}
        </div>

        <Separator className="my-6" />

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <span className="text-foreground">user@portfolio:~$</span>
          <span className="cursor-blink text-muted">projects</span>
        </div>
      </div>
    </div>
  )
}

export default Projects