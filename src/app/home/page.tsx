"use client";

import TransitionLink from "@/components/TransitionLink";
import { useEffect } from "react";
import { useGitHubStore } from "@/lib/store";
import TextReveal from "@/components/TextReveal";
import TerminalPrompt from "@/components/TerminalPrompt";
import { formatDate } from "@/utils/formatDate";

function Home() {
  const activity = useGitHubStore((s) => s.activity);
  const activityLoading = useGitHubStore((s) => s.activityLoading);
  const fetchActivity = useGitHubStore((s) => s.fetchActivity);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return (
    <div className="relative flex flex-col grow">
      {/* Linux prompt */}
      <TerminalPrompt command="whoami" />

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-12 grow items-start mt-2">
        {/* Left Column: Hero & Narrative */}
        <section className="lg:col-span-7 flex flex-col">
          <TextReveal
            text="Souvik Karmakar"
            className="text-3xl sm:text-4xl lg:text-5xl font-sans font-semibold tracking-tight text-foreground leading-[1.1]"
          />
          <p className="mt-2 text-sm sm:text-base font-mono text-command">
            Fullstack Developer &amp; Applied AI Engineer
          </p>

          <div className="mt-4 space-y-3 text-xs sm:text-sm font-sans text-muted leading-relaxed max-w-[62ch]">
            <p>
              Hi, I&apos;m Souvik. I design and build production web
              architectures, type-safe fullstack platforms, and applied AI
              systems.
            </p>
            <p>
              My focus is on resilient backend services, high-performance user
              interfaces with subtle motion, and real-time tooling that solves
              real engineering problems.
            </p>
          </div>

          {/* Action Row */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <TransitionLink
              href="/home/projects"
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent text-accent-foreground px-4 py-2 text-sm font-sans font-medium hover:bg-accent-hover transition shadow-[0_2px_12px_rgba(214,56,37,0.3)] cursor-pointer"
            >
              Explore Projects →
            </TransitionLink>
            <TransitionLink
              href="/home/contact"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-secondary/40 px-4 py-2 text-sm font-sans font-medium text-foreground hover:bg-surface-secondary/80 hover:border-command/30 transition cursor-pointer"
            >
              Contact Me
            </TransitionLink>
          </div>
        </section>

        {/* Right Column: Public Engineering Activity */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-surface/80 p-4 sm:p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-xs uppercase tracking-wider text-muted font-sans font-semibold">
                Recent Public Activity
              </h2>
              <span className="text-[10px] text-muted font-mono">
                github.com/SGOD-pro
              </span>
            </div>

            {activityLoading ? (
              <div className="mt-3 space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-1.5 rounded-lg border border-border bg-surface-secondary/20 p-2.5 animate-pulse"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-32 bg-surface-secondary/80 rounded" />
                      <div className="h-2.5 w-16 bg-surface-secondary/60 rounded" />
                    </div>
                    <div className="h-2.5 w-24 bg-surface-secondary/40 rounded" />
                  </div>
                ))}
              </div>
            ) : activity.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {activity.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-col gap-1 rounded-lg border border-border bg-surface-secondary/30 p-2.5 text-xs transition hover:border-command/40"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-foreground font-medium truncate max-w-[200px]">
                        {item.repo}
                      </span>
                      <span className="text-muted text-[10px] shrink-0">
                        {formatDate(item.date)}
                      </span>
                    </div>
                    <p className="text-muted text-[11px] font-sans truncate">
                      {item.description || item.type}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-4 text-center">
                <p className="text-xs text-muted font-sans">
                  Public repositories and commits tracked on GitHub.
                </p>
                <a
                  href="https://github.com/SGOD-pro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs font-mono text-command hover:underline"
                >
                  Inspect SGOD-pro on GitHub ↗
                </a>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
