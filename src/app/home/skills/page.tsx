import { Separator } from '@heroui/react'

const skills = [
	{
		title: 'Backend',
		layer: 'layer_02',
		accent: 'bg-accent',
		tags: ['Node.js', 'Go', 'Python', 'PostgreSQL'],
	},
	{
		title: 'Frontend',
		layer: 'layer_01',
		accent: 'bg-warning',
		tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
	},
	{
		title: 'AI/ML',
		layer: 'neural_net',
		accent: 'bg-command',
		tags: ['PyTorch', 'OpenAI API', 'Vector DBs', 'LangChain'],
	},
	{
		title: 'DevOps',
		layer: 'infra_04',
		accent: 'bg-danger',
		tags: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
	},
]

const metrics = [
	{ label: 'Optimization', value: '94%', accent: 'bg-accent' },
	{ label: 'Scalability', value: '89%', accent: 'bg-warning' },
	{ label: 'Precision', value: '99.9%', accent: 'bg-danger' },
]

function Skills() {
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
					<span className="text-[10px] uppercase tracking-[0.35em] text-segment">skills</span>
					<span className="ml-auto rounded-md border border-segment/60 bg-overlay/60 px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-segment">
						ssh · 127.0.0.1
					</span>
				</header>

				<div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
					<span className="text-foreground">user@portfolio:~$ skills</span>
					<span className="text-muted">
						Analyzing core competencies...{' '}
						<span className="text-accent">[INDEXING COMPLETE]</span>
					</span>
				</div>

				<Separator className="my-6" />

				<div className="grid gap-4 lg:grid-cols-12">
					{skills.map((group) => (
						<section
							key={group.title}
							className="relative rounded-xl border border-segment/70 bg-surface-secondary/60 p-4 shadow-[0_0_0_1px_var(--segment)] lg:col-span-6"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-segment">
									<span className="text-accent">▣</span>
									<span>{group.title}</span>
								</div>
								<span className="text-[10px] uppercase tracking-[0.3em] text-muted">[{group.layer}]</span>
							</div>
							<div className="mt-3 flex flex-wrap gap-2">
								{group.tags.map((tag) => (
									<span
										key={tag}
										className="rounded-md border border-segment/60 bg-overlay/60 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-segment"
									>
										{tag}
									</span>
								))}
							</div>
							<div className="mt-4 h-1.5 w-full rounded-full bg-overlay/60">
								<div className={`h-1.5 rounded-full ${group.accent}`} style={{ width: '78%' }} />
							</div>
						</section>
					))}
				</div>

				<div className="mt-6 grid gap-5 lg:grid-cols-12">
					<div className="relative overflow-hidden rounded-xl border border-segment/70 bg-surface-secondary/60 shadow-[0_0_0_1px_var(--segment)] lg:col-span-8">
						<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_60%)]" />
						<div className="relative h-full min-h-[230px] p-5">
							<p className="text-[10px] uppercase tracking-[0.3em] text-muted">Architectural Analysis</p>
							<div className="mt-4 flex h-full flex-col justify-end rounded-lg border border-segment/60 bg-overlay/30 px-5 py-6">
								<h3 className="text-2xl font-semibold text-foreground" style={{ fontFamily: 'var(--font-plex)' }}>
									Full Stack Mastery
								</h3>
								<p className="mt-2 text-sm text-muted" style={{ fontFamily: 'var(--font-sans)' }}>
									Cross-functional expertise in distributed systems and resilient UI frameworks.
								</p>
							</div>
						</div>
					</div>

					<div className="rounded-xl border border-segment/70 bg-surface-secondary/60 p-5 shadow-[0_0_0_1px_var(--segment)] lg:col-span-4">
						<p className="text-[10px] uppercase tracking-[0.3em] text-muted">System Load</p>
						<div className="mt-4 space-y-4">
							{metrics.map((metric) => (
								<div key={metric.label}>
									<div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-segment">
										<span>{metric.label}</span>
										<span className="text-muted">{metric.value}</span>
									</div>
									<div className="mt-2 h-1.5 w-full rounded-full bg-overlay/60">
										<div className={`h-1.5 rounded-full ${metric.accent}`} style={{ width: metric.value }} />
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				<Separator className="my-6" />

				<div className="flex flex-wrap items-center gap-3 text-xs text-muted">
					<span className="text-foreground">&gt; Execute command...</span>
					<span className="cursor-blink text-muted">_</span>
				</div>
			</div>
		</div>
	)
}

export default Skills
