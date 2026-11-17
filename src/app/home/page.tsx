"use client";

import { Separator } from "@heroui/react";

function Home() {
  return (
    <div className="relative flex flex-col grow">
      <div className="grid gap-6 lg:grid-cols-12 grow items-start">
        <section className="lg:col-span-7">
          <ul className="my-2">
            <li>
              <div className="flex items-center text-sm">
                <span className="mr-1 text-field-placeholder font-bold">souvik@portfolio:$</span>
                <span className="focus:outline-none text-command">
                  whoami
                </span>
              </div>
            </li>
            <li className="text-field-placeholder text-xs mt-1">
              <p>
                Identity Fetching <span className="uppercase text-success font-semibold">[success]</span>
              </p>
            </li>
          </ul>

          <h1
            className="text-4xl sm:text-5xl font-bold text-accent mt-3"
            style={{ fontFamily: "var(--font-plex)" }}
          >
            Souvik Karmakar
          </h1>
          <p
            className="mt-2 text-sm font-semibold text-foreground"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Fullstack Developer &amp; AI Enthusiast
          </p>
          <Separator className="my-4" />
          <p className="text-sm leading-relaxed text-muted">
            Passionate about crafting seamless digital experiences, I build robust web applications and explore the
            frontier of applied AI. I love turning complex challenges into elegant, maintainable systems.
          </p>

          <div className="mt-5 rounded-lg border border-segment/70 bg-overlay/60 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Pitch</p>
            <p className="mt-2 text-base sm:text-lg text-foreground" style={{ fontFamily: "var(--font-sans)" }}>
              &ldquo;Building performant, human-first interfaces with a systems mindset.&rdquo;
            </p>
          </div>
        </section>

        <section className="lg:col-span-5">
          <p className="text-xs uppercase tracking-[0.35em] text-muted">System Specs</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              { label: "Core", value: "Distributed Systems" },
              { label: "Models", value: "LLM Optimization" },
              { label: "Runtime", value: "JS / Go / Python" },
              { label: "Latency", value: "< 50ms Target" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-segment/70 bg-surface-secondary/70 p-3"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{item.label}</p>
                <p className="mt-1.5 text-sm font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <p className="text-xs uppercase tracking-[0.35em] text-muted">Logs</p>
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
  );
}

export default Home;
