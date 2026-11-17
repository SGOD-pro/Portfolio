"use client";

import React, { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Separator } from "@heroui/react";
import LineBox from "@/components/LineBox";
import { StaticCodeFallback } from "@/components/StaticCodeFallback";
import type { GitHubRepo } from "@/lib/github/types";

const CodeIcon3D = dynamic(() => import("@/components/3DCode"), {
  ssr: false,
  loading: () => <StaticCodeFallback color="#b46004" height={220} />,
});

const REPO_NAME_REGEX = /^[a-zA-Z0-9_.-]+$/;

function isValidHttpUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

interface RepoDetailsResponse {
  repo: GitHubRepo;
  languages: Record<string, number>;
  isStale: boolean;
  fetchedAt: string;
}

function ProjectMetadataSidebar({ project }: { project: string }) {
  const [data, setData] = useState<RepoDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const activeDoc = searchParams.get("doc") || "readme";

  useEffect(() => {
    let active = true;

    fetch(`/api/github/repo/${encodeURIComponent(project)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json: RepoDetailsResponse) => {
        if (active) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [project]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 font-mono text-[11px] p-2 animate-pulse">
        <div className="h-3 w-28 bg-white/10 rounded" />
        <div className="h-5 w-40 bg-white/10 rounded" />
        <div className="h-12 w-full bg-white/5 rounded" />
        <Separator className="my-2 border-white/10" />
        <div className="h-20 w-full bg-white/5 rounded" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col gap-3 font-mono text-[11px] p-2">
        <p className="text-[10px] uppercase tracking-wider text-muted font-medium">Project Telemetry</p>
        <p className="text-danger text-xs">[Telemetry unavailable]</p>
        <p className="text-muted text-[10px]">
          Could not retrieve repository metadata for {project}.
        </p>
        <Link
          href="/home/projects"
          className="mt-2 text-accent text-xs underline underline-offset-2 hover:text-accent/80"
        >
          ← Return to project list
        </Link>
      </div>
    );
  }

  const { repo, languages } = data;
  const totalBytes = Object.values(languages).reduce((sum, val) => sum + val, 0);
  const langEntries = Object.entries(languages).sort((a, b) => b[1] - a[1]);

  const hasHomepage = isValidHttpUrl(repo.homepage);

  return (
    <div className="relative flex flex-col w-full h-full p-1 sm:p-2 font-mono text-[11px]">
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-wider text-muted font-medium">
          PROJECT TELEMETRY
        </span>
        <Link
          href="/home/projects"
          className="text-[9px] text-muted hover:text-accent transition uppercase tracking-wider"
        >
          [CLOSE]
        </Link>
      </div>

      <h3 className="mt-1.5 text-xs sm:text-sm font-bold text-foreground font-mono leading-tight">
        {repo.name}
      </h3>
      {repo.description && (
        <p className="mt-1 text-[11px] text-muted font-mono leading-relaxed">
          {repo.description}
        </p>
      )}

      {/* Primary Actions: Source & Website */}
      <div className="mt-2.5 flex flex-wrap gap-2">
        <a
          href={repo.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[10px] text-accent hover:border-accent hover:bg-white/[0.08] transition"
        >
          <span>GitHub</span>
          <span>↗</span>
        </a>

        {hasHomepage && (
          <a
            href={repo.homepage!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded border border-success/30 bg-success/10 px-2.5 py-1 text-[10px] text-success hover:border-success/60 hover:bg-success/20 transition"
          >
            <span>Live Website</span>
            <span>↗</span>
          </a>
        )}
      </div>

      <Separator className="my-3 border-white/10" />

      {/* Document View Switcher */}
      <div>
        <p className="text-[9px] uppercase tracking-wider text-muted font-medium mb-1.5">
          ACTIVE DOCUMENT
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          <Link
            href={`/home/projects?project=${encodeURIComponent(project)}&doc=readme`}
            className={`rounded px-2 py-1 text-center text-[10px] font-mono transition ${
              activeDoc !== "architecture"
                ? "border border-accent text-accent bg-accent/20 font-semibold"
                : "border border-white/10 text-muted hover:text-foreground hover:border-white/20"
            }`}
          >
            README.md
          </Link>
          <Link
            href={`/home/projects?project=${encodeURIComponent(project)}&doc=architecture`}
            className={`rounded px-2 py-1 text-center text-[10px] font-mono transition ${
              activeDoc === "architecture"
                ? "border border-accent text-accent bg-accent/20 font-semibold"
                : "border border-white/10 text-muted hover:text-foreground hover:border-white/20"
            }`}
          >
            Architecture
          </Link>
        </div>
      </div>

      <Separator className="my-3 border-white/10" />

      {/* Programming Languages Breakdown */}
      <div>
        <p className="text-[9px] uppercase tracking-wider text-muted font-medium mb-1.5">
          LANGUAGES BREAKDOWN
        </p>
        {totalBytes > 0 ? (
          <div>
            {/* Stacked bar */}
            <div className="h-1.5 w-full rounded-full bg-white/10 flex overflow-hidden mb-2">
              {langEntries.map(([lang, bytes], idx) => {
                const pct = (bytes / totalBytes) * 100;
                const colors = [
                  "bg-accent",
                  "bg-warning",
                  "bg-command",
                  "bg-success",
                  "bg-danger",
                ];
                return (
                  <div
                    key={lang}
                    className={colors[idx % colors.length]}
                    style={{ width: `${pct}%` }}
                    title={`${lang}: ${pct.toFixed(1)}%`}
                  />
                );
              })}
            </div>
            {/* Language list */}
            <ul className="space-y-1 text-[10px] text-muted">
              {langEntries.slice(0, 5).map(([lang, bytes]) => {
                const pct = ((bytes / totalBytes) * 100).toFixed(1);
                return (
                  <li key={lang} className="flex items-center justify-between">
                    <span className="text-foreground">{lang}</span>
                    <span>{pct}%</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className="text-[10px] text-muted italic">None recorded</p>
        )}
      </div>

      <Separator className="my-3 border-white/10" />

      {/* Repository Timeline / Dates */}
      <div>
        <p className="text-[9px] uppercase tracking-wider text-muted font-medium mb-1.5">
          TIMELINE &amp; REPO INFO
        </p>
        <div className="space-y-1 text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-muted">Default branch:</span>
            <span className="text-foreground">{repo.defaultBranch}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Last pushed:</span>
            <span className="text-foreground">{formatDate(repo.updatedAt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Stars / Forks:</span>
            <span className="text-accent">
              ★ {repo.stargazersCount} · ⑂ {repo.forksCount}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <Link
          href="/home/projects"
          className="w-full text-center block rounded border border-white/10 py-1.5 text-[10px] text-muted hover:text-foreground hover:border-white/30 transition"
        >
          ← Return to project list
        </Link>
      </div>
    </div>
  );
}

function DefaultSidebar() {
  return (
    <div className="relative flex flex-col w-full h-full p-2 sm:p-3 font-mono">
      <div className="h-[220px] w-full relative flex items-center justify-center overflow-hidden">
        <CodeIcon3D
          extrudeDepth={1.2}
          color="#b46004"
          emissiveColor="#b46004"
          size={3}
          rotationSpeed={0.3}
          metalness={0.5}
          roughness={0.8}
          bevelEnabled={true}
          bevelThickness={0.1}
          bevelSize={0.05}
          autoRotate={false}
          background="transparent"
          height={220}
          width="100%"
        />
      </div>

      <Separator className="my-3 border-white/10" />

      <aside className="w-full">
        <h2 className="text-[9px] uppercase tracking-widest text-muted/80 font-mono font-medium">Connect</h2>
        <section className="mt-2.5 flex flex-col gap-2">
          <LineBox className="w-full">
            <Link
              href="https://github.com/SGOD-pro"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full min-w-0 flex-col gap-0.5 group py-1 focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-1 rounded"
            >
              <span className="text-muted text-[11px] tracking-wider uppercase group-hover:text-accent font-plex font-semibold">
                GitHub
              </span>
              <span className="truncate w-full text-command lowercase text-[11px]">
                github.com/SGOD-pro
              </span>
            </Link>
          </LineBox>

          <LineBox className="w-full">
            <Link
              href="https://www.linkedin.com/in/souvik-karmakar-578097274/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full min-w-0 flex-col gap-0.5 group py-1 focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-1 rounded"
            >
              <span className="text-muted text-[11px] tracking-wider uppercase group-hover:text-accent font-plex font-semibold">
                LinkedIn
              </span>
              <span className="truncate w-full text-command lowercase text-[11px]">
                linkedin.com/in/souvik-karmakar
              </span>
            </Link>
          </LineBox>

          <LineBox className="w-full">
            <Link
              href="mailto:souvik.dev07@gmail.com"
              className="flex w-full min-w-0 flex-col gap-0.5 group py-1 focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-1 rounded"
            >
              <span className="text-muted text-[11px] tracking-wider uppercase group-hover:text-accent font-plex font-semibold">
                Email
              </span>
              <span className="truncate w-full text-command lowercase text-[11px]">
                souvik.dev07@gmail.com
              </span>
            </Link>
          </LineBox>
        </section>
      </aside>
    </div>
  );
}

function RightSideContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isProjectsRoute = pathname === "/home/projects";
  const projectParam = searchParams.get("project");

  const sanitizedProject =
    projectParam && REPO_NAME_REGEX.test(projectParam) ? projectParam : null;

  if (isProjectsRoute && sanitizedProject) {
    return <ProjectMetadataSidebar key={sanitizedProject} project={sanitizedProject} />;
  }

  return <DefaultSidebar />;
}

export default function RightSide() {
  return (
    <Suspense fallback={<StaticCodeFallback color="#b46004" height={220} />}>
      <RightSideContent />
    </Suspense>
  );
}
