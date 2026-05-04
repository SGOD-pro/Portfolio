import { Separator } from '@heroui/react'

function Home() {
    return (
        <div className="relative h-full overflow-hidden rounded-xl border border-segment bg-surface/80 shadow-[0_0_0_1px_var(--segment)]">
            <div className="relative flex h-full flex-col px-6 py-5">
                <div className="grow">
                    <div className="flex items-center gap-2 text-xs text-muted">
                        <span className="h-2.5 w-2.5 rounded-full bg-danger" />
                        <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                        <span className="h-2.5 w-2.5 rounded-full bg-success" />
                        <span className="ml-3 font-medium tracking-[0.2em] uppercase text-segment">portfolio shell</span>
                    </div>

                    <div className="mt-6 grid gap-6 lg:grid-cols-12 grow">
                        <section className="lg:col-span-7">
                            <p className="text-xs uppercase tracking-[0.35em] text-segment">Identity</p>
                            <h1 className="mt-2 text-4xl font-bold text-accent" style={{ fontFamily: "var(--font-plex)" }}>
                                Souvik Karmakar
                            </h1>
                            <p className="mt-2 text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                                Fullstack Developer &amp; AI Enthusiast
                            </p>
                            <Separator className="my-4" />
                            <p className="text-sm leading-relaxed text-segment">
                                Passionate about crafting seamless digital experiences, I build robust web applications and explore the
                                frontier of applied AI. I love turning complex challenges into elegant, maintainable systems.
                            </p>

                            <div className="mt-6 rounded-lg border border-segment/70 bg-overlay/60 p-4">
                                <p className="text-xs uppercase tracking-[0.3em] text-muted">Pitch</p>
                                <p className="mt-2 text-lg text-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                                    &ldquo;Building performant, human-first interfaces with a systems mindset.&rdquo;
                                </p>
                            </div>
                        </section>

                        <section className="lg:col-span-5">
                            <p className="text-xs uppercase tracking-[0.35em] text-segment">System Specs</p>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                {[
                                    { label: "Core", value: "Distributed Systems" },
                                    { label: "Models", value: "LLM Optimization" },
                                    { label: "Runtime", value: "Rust / Go / Python" },
                                    { label: "Latency", value: "< 50ms Target" },
                                ].map((item) => (
                                    <div key={item.label} className="rounded-lg border border-segment/70 bg-surface-secondary/70 p-3">
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{item.label}</p>
                                        <p className="mt-2 text-sm font-semibold text-foreground">{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5">
                                <p className="text-xs uppercase tracking-[0.35em] text-segment">Logs</p>
                                <ul className="mt-3 space-y-2 text-xs text-muted">
                                    <li className="flex items-center justify-between rounded-md border border-segment/50 bg-overlay/50 px-3 py-2">
                                        <span>[2023-11-20]</span>
                                        <span className="text-foreground">deploy: neural_engine_v4</span>
                                    </li>
                                    <li className="flex items-center justify-between rounded-md border border-segment/50 bg-overlay/50 px-3 py-2">
                                        <span>[2024-01-15]</span>
                                        <span className="text-foreground">init: project_genesis</span>
                                    </li>
                                    <li className="flex items-center justify-between rounded-md border border-segment/50 bg-overlay/50 px-3 py-2">
                                        <span>[2024-03-02]</span>
                                        <span className="text-warning">upgrade: k8s_cluster_main</span>
                                    </li>
                                </ul>
                            </div>
                        </section>
                    </div>
                </div>
                <Separator className="my-6" />

                <div className="mt-auto flex flex-wrap items-center gap-3 text-sm">
                    <span className="text-muted">&gt; type a command...</span>
                    <div className="ml-auto flex items-center gap-2 text-xs text-segment">
                        {['skills', 'projects', 'experience', 'contact'].map((tag) => (
                            <span key={tag} className="rounded-md border border-segment/70 px-2 py-1 hover:text-foreground cursor-pointer hover:border-foreground transition-colors">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home