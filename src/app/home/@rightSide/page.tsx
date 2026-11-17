"use client";

import React, { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Separator } from "@heroui/react";
import LineBox from "@/components/LineBox";
import { StaticCodeFallback } from "@/components/StaticCodeFallback";
import type { GitHubRepo, GitHubProfile } from "@/lib/github/types";
import { getLocalCache, setLocalCache } from "@/lib/client-cache";
import { useReveal } from "@/hooks/useReveal";
import AnimatedNumber from "@/components/AnimatedNumber";
import AnimatedLanguageBar from "@/components/AnimatedLanguageBar";

const CodeIcon3D = dynamic(() => import("@/components/3DCode"), {
  ssr: false,
  loading: () => <StaticCodeFallback color="#D63825" height={220} />,
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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const cacheKey = `repo:${project}`;
  const [data, setData] = useState<RepoDetailsResponse | null>(() => {
    return getLocalCache<RepoDetailsResponse>(cacheKey);
  });
  const [loading, setLoading] = useState(() => {
    return !getLocalCache<RepoDetailsResponse>(cacheKey);
  });
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const activeDoc = searchParams.get("doc") || "readme";

  useReveal(containerRef, [project, data]);

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
          setLocalCache(cacheKey, json);
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
  }, [project, cacheKey]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 font-mono text-[11px] p-2 animate-pulse">
        <div className="h-3 w-28 bg-surface-secondary rounded" />
        <div className="h-5 w-40 bg-surface-secondary rounded" />
        <div className="h-12 w-full bg-surface-secondary/60 rounded" />
        <Separator className="my-2 border-border" />
        <div className="h-20 w-full bg-surface-secondary/60 rounded" />
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
          className="mt-2 text-command text-xs underline underline-offset-2 hover:text-command/80"
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
    <div ref={containerRef} className="relative flex flex-col w-full h-full p-1 sm:p-2 font-mono text-[11px]">
      <div className="flex items-center justify-between" data-reveal>
        <span className="text-[9px] uppercase tracking-wider text-muted font-medium">
          PROJECT TELEMETRY
        </span>
        <Link
          href="/home/projects"
          className="text-[9px] text-muted hover:text-command transition uppercase tracking-wider"
        >
          [CLOSE]
        </Link>
      </div>

      <div data-reveal className="mt-1.5">
        <h3 className="text-xs sm:text-sm font-bold text-foreground font-mono leading-tight">
          {repo.name}
        </h3>
        {repo.description && (
          <p className="mt-1 text-[11px] text-muted font-mono leading-relaxed">
            {repo.description}
          </p>
        )}
      </div>

      {/* Primary Actions: Source & Website */}
      <div className="mt-2.5 flex flex-wrap gap-2">
        <a
          href={repo.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded border border-border bg-surface-secondary/40 px-2.5 py-1 text-[10px] text-command hover:border-accent hover:text-accent hover:bg-accent/10 transition"
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

      <Separator className="my-3 border-border" />

      {/* Document View Switcher */}
      <div data-reveal>
        <p className="text-[9px] uppercase tracking-wider text-muted font-medium mb-1.5">
          ACTIVE DOCUMENT
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          <Link
            href={`/home/projects?project=${encodeURIComponent(project)}&doc=readme`}
            aria-selected={activeDoc !== "architecture"}
            className={`rounded px-2 py-1 text-center text-[10px] font-mono transition ${
              activeDoc !== "architecture"
                ? "border border-command text-command bg-command/20 font-semibold"
                : "border border-border text-muted hover:text-accent hover:border-accent/40"
            }`}
          >
            README.md
          </Link>
          <Link
            href={`/home/projects?project=${encodeURIComponent(project)}&doc=architecture`}
            aria-selected={activeDoc === "architecture"}
            className={`rounded px-2 py-1 text-center text-[10px] font-mono transition ${
              activeDoc === "architecture"
                ? "border border-command text-command bg-command/20 font-semibold"
                : "border border-border text-muted hover:text-accent hover:border-accent/40"
            }`}
          >
            Architecture
          </Link>
        </div>
      </div>

      <Separator className="my-3 border-border" />

      {/* Programming Languages Breakdown */}
      <div data-reveal>
        <p className="text-[9px] uppercase tracking-wider text-muted font-medium mb-2">
          LANGUAGES BREAKDOWN
        </p>
        {totalBytes > 0 ? (
          <div className="space-y-2">
            {langEntries.slice(0, 6).map(([lang, bytes], idx) => {
              const pctNumber = (bytes / totalBytes) * 100;
              const pctDisplay =
                pctNumber < 0.1 && pctNumber > 0 ? "< 0.1%" : `${pctNumber.toFixed(1)}%`;
              const colors = [
                "bg-command",
                "bg-warning",
                "bg-accent",
                "bg-success",
                "bg-danger",
                "bg-[#6EA1CA]",
              ];
              const color = colors[idx % colors.length];

              return (
                <div key={lang} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
                      <span className="text-foreground">{lang}</span>
                    </div>
                    <span className="text-muted text-[10px]">{pctDisplay}</span>
                  </div>
                  <AnimatedLanguageBar percentage={pctNumber} color={color} />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[10px] text-muted italic">None recorded</p>
        )}
      </div>

      <Separator className="my-3 border-border" />

      {/* Repository Timeline / Dates */}
      <div data-reveal>
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
            <span className="text-command inline-flex items-center gap-1.5">
              <span>★</span>
              <AnimatedNumber value={repo.stargazersCount} />
              <span className="text-muted/40">·</span>
              <span>⑂</span>
              <AnimatedNumber value={repo.forksCount} />
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <Link
          href="/home/projects"
          className="w-full text-center block rounded border border-border py-1.5 text-[10px] text-muted hover:text-foreground hover:border-command/40 transition"
        >
          ← Return to project list
        </Link>
      </div>
    </div>
  );
}

function DefaultSidebar() {
  const [profile, setProfile] = useState<GitHubProfile | null>(null);

  useEffect(() => {
    let active = true;
    const cached = getLocalCache<GitHubProfile>("profile:SGOD-pro");
    if (cached) {
      queueMicrotask(() => {
        if (active) setProfile(cached);
      });
    }

    fetch("/api/github/profile")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then((data) => {
        if (active && data?.profile) {
          setProfile(data.profile);
          setLocalCache("profile:SGOD-pro", data.profile);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const displayName = profile?.name
    ? profile.name.toLowerCase() === "souvik karmakar"
      ? "Souvik Karmakar"
      : profile.name
    : "Souvik Karmakar";

  return (
    <div className="relative flex flex-col w-full h-full p-2 sm:p-3 font-mono group">
      {/* 3D Code Block */}
      <div className="h-[170px] w-full relative flex items-center justify-center overflow-hidden shrink-0">
        <CodeIcon3D
          extrudeDepth={1.2}
          color="#D63825"
          emissiveColor="#3F1A13"
          size={3}
          rotationSpeed={0.5}
          metalness={0.5}
          roughness={0.8}
          bevelEnabled={true}
          bevelThickness={0.1}
          bevelSize={0.05}
          autoRotate={true}
          pauseOnHover={true}
          background="transparent"
          height={170}
          width="100%"
        />
      </div>

      {/* Hover text under the 3D block */}
      <div className="text-center min-h-[22px] py-1 transition-all">
        <p className="text-[11px] tracking-wider font-mono text-muted/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          CODE WITH <span className="text-accent font-bold">CAFFEINE</span>
        </p>
      </div>

      <Separator className="my-2 border-border" />

      {/* GitHub Profile Picture & Stats */}
      <div className="flex items-center gap-3.5 py-2.5 px-1 shrink-0">
        <a
          href="https://github.com/SGOD-pro"
          target="_blank"
          rel="noopener noreferrer"
          className="relative group/avatar focus-visible:outline-2 focus-visible:outline-focus rounded-full transition-transform hover:scale-105 shrink-0"
          title="View SGOD-pro on GitHub"
        >
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full p-0.5 border border-border bg-surface-secondary/40 group-hover/avatar:border-command transition-all duration-300 shadow-[0_0_18px_rgba(156,175,136,0.25)]">
            <Image
              unoptimized
              src="https://github.com/SGOD-pro.png?size=200"
              alt="Souvik Karmakar"
              width={72}
              height={72}
              className="w-full h-full rounded-full object-cover"
              loading="lazy"
            />
          </div>
          <span
            className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-success border-2 border-background shadow-[0_0_8px_rgba(102,170,140,0.6)]"
            title="Active"
          />
        </a>

        {/* Stats beside profile picture */}
        <div className="flex flex-col min-w-0 font-mono">
          <div className="flex items-center gap-1.5 truncate">
            <span
              suppressHydrationWarning
              className="text-xs sm:text-[13px] font-semibold text-foreground truncate"
            >
              {displayName}
            </span>
          </div>
          <span className="text-[10px] text-muted -mt-0.5 mb-1.5 block">
            @SGOD-pro
          </span>

          {/* Contributions + Followers + Following */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px]">
            <span className="inline-flex items-center gap-1" title="Contributions in the last year">
              <strong className="text-command font-bold" suppressHydrationWarning>
                <AnimatedNumber value={profile?.totalContributions || 833} />
              </strong>
              <span className="text-muted/80">contribs</span>
            </span>
            <span className="text-muted/40">·</span>
            <span className="inline-flex items-center gap-1" title="GitHub Followers">
              <strong className="text-foreground font-semibold" suppressHydrationWarning>
                <AnimatedNumber value={profile?.followers ?? 8} />
              </strong>
              <span className="text-muted/80">followers</span>
            </span>
            <span className="text-muted/40">·</span>
            <span className="inline-flex items-center gap-1" title="GitHub Following">
              <strong className="text-foreground font-semibold" suppressHydrationWarning>
                <AnimatedNumber value={profile?.following ?? 2} />
              </strong>
              <span className="text-muted/80">following</span>
            </span>
          </div>
        </div>
      </div>

      <Separator className="my-2 border-border" />

      <aside className="w-full">
        <h2 className="text-[9px] uppercase tracking-widest text-muted/80 font-mono font-medium">Connect</h2>
        <section className="mt-2.5 flex flex-col gap-2">
          <LineBox className="w-full">
            <Link
              href="https://github.com/SGOD-pro"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full min-w-0 flex-col gap-0.5 group py-1 focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-1 rounded transition-colors"
            >
              <span className="text-muted text-xs tracking-wider uppercase group-hover:text-accent font-sans font-semibold transition-colors">
                GitHub
              </span>
              <span className="truncate w-full text-command lowercase text-xs font-mono">
                github.com/SGOD-pro
              </span>
            </Link>
          </LineBox>

          <LineBox className="w-full">
            <Link
              href="https://www.linkedin.com/in/souvik-karmakar-578097274/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full min-w-0 flex-col gap-0.5 group py-1 focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-1 rounded transition-colors"
            >
              <span className="text-muted text-xs tracking-wider uppercase group-hover:text-accent font-sans font-semibold transition-colors">
                LinkedIn
              </span>
              <span className="truncate w-full text-command lowercase text-xs font-mono">
                linkedin.com/in/souvik-karmakar
              </span>
            </Link>
          </LineBox>

          <LineBox className="w-full">
            <Link
              href="mailto:souvik.dev07@gmail.com"
              className="flex w-full min-w-0 flex-col gap-0.5 group py-1 focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-1 rounded transition-colors"
            >
              <span className="text-muted text-xs tracking-wider uppercase group-hover:text-accent font-sans font-semibold transition-colors">
                Email
              </span>
              <span className="truncate w-full text-command lowercase text-xs font-mono">
                souvik.dev07@gmail.com
              </span>
            </Link>
          </LineBox>

          <LineBox className="w-full">
            <a
              href="https://drive.google.com/file/d/165G0scNbWuux1aZ_VwSSXlds1Hw2-AL6/view?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full min-w-0 flex-col gap-0.5 group py-1 focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-1 rounded transition-colors"
              title="Open Souvik Karmakar's official Resume in Google Drive"
            >
              <div className="flex items-center justify-between">
                <span className="text-muted text-xs tracking-wider uppercase group-hover:text-accent font-sans font-semibold transition-colors">
                  Resume / CV
                </span>
                <span className="text-[10px] text-command font-mono">[PDF ↗]</span>
              </div>
              <span className="truncate w-full text-command lowercase text-xs font-mono">
                drive.google.com/.../resume.pdf
              </span>
            </a>
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
    <Suspense fallback={<StaticCodeFallback color="#D63825" height={220} />}>
      <RightSideContent />
    </Suspense>
  );
}
