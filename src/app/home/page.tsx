"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import type { GitHubActivityItem } from "@/lib/github/types";
import { getLocalCache, setLocalCache } from "@/lib/client-cache";
import { useReveal } from "@/hooks/useReveal";
import TextReveal from "@/components/TextReveal";

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return isoString;
  }
}

function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activity, setActivity] = useState<GitHubActivityItem[]>(() => {
    return getLocalCache<GitHubActivityItem[]>("activity:SGOD-pro") || [];
  });
  const [activityLoading, setActivityLoading] = useState(() => {
    return !getLocalCache<GitHubActivityItem[]>("activity:SGOD-pro");
  });

  useReveal(containerRef, [activity]);

  useEffect(() => {
    let active = true;
    fetch("/api/github/activity")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to fetch activity"))))
      .then((data) => {
        if (active && Array.isArray(data.activity)) {
          const items = data.activity.slice(0, 4);
          setActivity(items);
          setLocalCache("activity:SGOD-pro", items);
        }
      })
      .catch(() => {
        // Quiet fallback if offline or rate limited
      })
      .finally(() => {
        if (active) setActivityLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div ref={containerRef} className="relative flex flex-col grow">
      {/* Linux prompt */}
      <div className="my-1.5 flex items-center gap-2 text-xs font-mono" data-reveal>
        <span className="text-field-placeholder font-bold">souvik@portfolio:~$</span>
        <span className="text-command">whoami</span>
      </div>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-12 grow items-start mt-2">
        {/* Left Column: Hero & Narrative */}
        <section className="lg:col-span-7 flex flex-col">
          <TextReveal
            text="Souvik Karmakar"
            className="text-3xl sm:text-4xl lg:text-[46px] font-sans font-semibold tracking-[-0.02em] text-foreground leading-[1.12]"
            delay={0.16}
            stagger={0.025}
          />
          <p className="mt-2 text-base sm:text-lg font-sans font-medium text-accent leading-snug">
            Fullstack Developer &amp; Applied AI Engineer
          </p>

          <div className="my-4 h-px w-full bg-white/10" />

          <p className="text-base font-sans text-muted leading-[1.65] max-w-[58ch]">
            I build responsive web applications and applied AI tools. Focused on clean
            component architectures, robust APIs, and practical developer experiences.
          </p>

          <p className="mt-3 text-sm font-sans text-muted/90 leading-[1.6] max-w-[58ch]">
            Specialized in TypeScript, Next.js, Python, and modern cloud deployment with a strong
            emphasis on performance and accessibility.
          </p>

          {/* Primary & Secondary Actions */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link
              href="/home/projects"
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent text-accent-foreground px-4 py-2 text-sm font-sans font-medium hover:opacity-95 transition shadow-[0_2px_12px_rgba(180,96,4,0.3)] cursor-pointer"
            >
              View projects →
            </Link>
            <Link
              href="/home/contact"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-sans font-medium text-foreground hover:bg-white/[0.08] hover:border-white/25 transition cursor-pointer"
            >
              Get in touch
            </Link>
          </div>
        </section>

        {/* Right Column: Public Engineering Activity */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-xs uppercase tracking-wider text-muted font-sans font-semibold">
                Recent Public Activity
              </h2>
              <span className="text-[10px] text-muted font-mono">github.com/SGOD-pro</span>
            </div>

            {activityLoading ? (
              <div className="py-6 text-center text-xs text-muted font-sans animate-pulse">
                Loading public activity...
              </div>
            ) : activity.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {activity.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-col gap-1 rounded-lg border border-white/[0.07] bg-white/[0.02] p-2.5 text-xs transition hover:border-white/20"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-foreground font-medium truncate max-w-[200px]">
                        {item.repo}
                      </span>
                      <span className="text-muted text-[10px] shrink-0">{formatDate(item.date)}</span>
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
                  className="mt-2 inline-block text-xs font-mono text-accent hover:underline"
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
