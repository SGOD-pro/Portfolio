"use client";

import { Separator } from "@heroui/react";

function Home() {
  return (
    <div className="relative flex flex-col grow">
      <div className="grid gap-6 lg:grid-cols-12 grow items-start">
        <section className="lg:col-span-7">
          <ul className="my-1.5">
            <li>
              <div className="flex items-center text-[11px] font-mono">
                <span className="mr-1.5 text-field-placeholder font-bold">souvik@portfolio:$</span>
                <span className="focus:outline-none text-command">whoami</span>
              </div>
            </li>
            <li className="text-field-placeholder text-[10px] mt-0.5 font-mono">
              <p>
                Identity Fetching <span className="uppercase text-success font-semibold">[success]</span>
              </p>
            </li>
          </ul>

          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-accent mt-2.5 font-mono leading-snug">
            Souvik Karmakar
          </h1>
          <p className="mt-0.5 text-[11px] sm:text-xs font-medium text-foreground font-mono leading-snug">
            Fullstack Developer &amp; AI Enthusiast
          </p>
          <Separator className="my-3.5 border-white/10" />
          <p className="text-[11px] sm:text-xs leading-relaxed text-muted font-mono max-w-xl">
            Passionate about crafting seamless digital experiences, I build robust web applications and explore the
            frontier of applied AI. I love turning complex challenges into elegant, maintainable systems.
          </p>

          <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-3.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <p className="text-[9px] uppercase tracking-wider text-muted font-mono font-medium">Pitch</p>
            <blockquote className="mt-1 text-[11px] sm:text-xs text-foreground/90 font-mono leading-relaxed italic border-l-2 border-accent pl-3">
              &ldquo;Building performant, human-first interfaces with a systems mindset.&rdquo;
            </blockquote>
          </div>
        </section>

        <section className="lg:col-span-5">
          <p className="text-[9px] uppercase tracking-wider text-muted font-mono font-medium">System Specs</p>
          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
            {[
              { label: "Core", value: "Distributed Systems" },
              { label: "Models", value: "LLM Optimization" },
              { label: "Runtime", value: "JS / Go / Python" },
              { label: "Latency", value: "< 50ms Target" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
              >
                <p className="text-[9px] uppercase tracking-wider text-muted font-mono">{item.label}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-foreground font-mono leading-snug">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <p className="text-[9px] uppercase tracking-wider text-muted font-mono font-medium">Logs</p>
            <ul className="mt-2 space-y-1.5 text-[11px] text-muted font-mono">
              <li className="flex items-center justify-between rounded border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5">
                <span>[2023-11-20]</span>
                <span className="text-foreground">deploy: neural_engine_v4</span>
              </li>
              <li className="flex items-center justify-between rounded border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5">
                <span>[2024-01-15]</span>
                <span className="text-foreground">init: project_genesis</span>
              </li>
              <li className="flex items-center justify-between rounded border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5">
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
