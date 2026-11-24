"use client";

import React, { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import LineBox from "@/components/LineBox";
import { StaticCodeFallback } from "@/components/StaticCodeFallback";
import type { GitHubRepo } from "@/lib/github/types";
import { getLocalCache, setLocalCache } from "@/lib/client-cache";
import { useGitHubStore } from "@/lib/store";
import AnimatedNumber from "@/components/AnimatedNumber";
import AnimatedLanguageBar from "@/components/AnimatedLanguageBar";
import { formatDate } from "@/utils/formatDate";
import { isValidRepoName } from "@/lib/github/api";
import RightSideLoading from "./loading";

const CodeIcon3D = dynamic(() => import("@/components/3DCode"), {
  ssr: false,
  loading: () => <StaticCodeFallback color="#D63825" height={220} />,
});

function isValidHttpUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

interface RepoDetailsResponse {
  repo: GitHubRepo;
  languages: Record<string, number>;
  isStale: boolean;
  fetchedAt: string;
}

function ProjectMetadataSidebar({ project }: { project: string }) {
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

  const projectsData = useGitHubStore((s) => s.projectsData);
  const selectedRepo = projectsData?.projects.find(
    (p) => p.name.toLowerCase() === project.toLowerCase()
  );
  const repoOwner = selectedRepo?.fullName?.includes("/")
    ? selectedRepo.fullName.split("/")[0]
    : undefined;

  useEffect(() => {
    let active = true;

    const ownerParam = repoOwner ? `?owner=${encodeURIComponent(repoOwner)}` : "";
    fetch(`/api/github/repo/${encodeURIComponent(project)}${ownerParam}`)
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
  }, [project, repoOwner, cacheKey]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 font-mono text-[11px] p-2 animate-pulse">
        <div className="h-3 w-28 bg-surface-secondary rounded" />
        <div className="h-5 w-40 bg-surface-secondary rounded" />
        <div className="h-12 w-full bg-surface-secondary/60 rounded" />
        <div role="separator" aria-orientation="horizontal" className="my-2 border-b border-border w-full shrink-0" />
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
    <div className="relative flex flex-col w-full h-full p-1 sm:p-2 font-mono text-[11px]">
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

      <div role="separator" aria-orientation="horizontal" className="my-3 border-b border-border w-full shrink-0" />

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

      <div role="separator" aria-orientation="horizontal" className="my-3 border-b border-border w-full shrink-0" />

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

      <div role="separator" aria-orientation="horizontal" className="my-3 border-b border-border w-full shrink-0" />

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
  const profile = useGitHubStore((s) => s.profile);
  const fetchProfile = useGitHubStore((s) => s.fetchProfile);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const displayName = profile?.name
    ? profile.name.toLowerCase() === "souvik karmakar"
      ? "Souvik Karmakar"
      : profile.name
    : "Souvik Karmakar";

  return (
    <div className="relative flex flex-col w-full h-full p-2 sm:p-3 font-mono">
      {/* 3D Code Block */}
      <div className="group/code h-[170px] w-full relative flex items-center justify-center overflow-hidden shrink-0">
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
        {/* Hover text under the 3D block */}
        <div className="absolute bottom-1 left-0 right-0 text-center pointer-events-none transition-all">
          <p className="text-[11px] tracking-wider font-mono text-muted/90 opacity-0 group-hover/code:opacity-100 transition-opacity duration-200">
            CODE WITH <span className="text-accent font-bold">CAFFEINE</span>
          </p>
        </div>
      </div>

      <div role="separator" aria-orientation="horizontal" className="my-2 border-b border-border w-full shrink-0" />

      {/* GitHub Profile Picture & Stats - Prominent Avatar with details below */}
      <div className="flex flex-col items-center text-center gap-2.5 py-3 px-1 shrink-0">
        <a
          href="https://github.com/SGOD-pro"
          target="_blank"
          rel="noopener noreferrer"
          className="relative group/avatar focus-visible:outline-2 focus-visible:outline-focus rounded-full transition-transform hover:scale-105 shrink-0"
          title="View SGOD-pro on GitHub"
        >
          <div className="relative w-24 h-24 sm:w-26 sm:h-26 rounded-full p-1 border-2 border-border/70 bg-surface-secondary/40 group-hover/avatar:border-command transition-all duration-300 shadow-[0_0_24px_rgba(156,175,136,0.3)]">
            <Image
              unoptimized
              src="https://github.com/SGOD-pro.png?size=300"
              alt="Souvik Karmakar"
              width={104}
              height={104}
              className="w-full h-full rounded-full object-cover"
              priority
            />
          </div>
          <span
            className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-success border-2 border-background shadow-[0_0_10px_rgba(102,170,140,0.8)]"
            title="Active"
          />
        </a>

        {/* Details below profile picture */}
        <div className="flex flex-col items-center font-mono">
          <span
            suppressHydrationWarning
            className="text-sm sm:text-base font-bold text-foreground tracking-tight"
          >
            {displayName}
          </span>
          <span className="text-[11px] text-muted -mt-0.5 mb-1.5">
            @SGOD-pro
          </span>

          {/* Contributions + Followers + Following */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px]">
            <span className="inline-flex items-center gap-1" title="Contributions in the last year">
              <strong className="text-command font-bold" suppressHydrationWarning>
                <AnimatedNumber value={profile?.totalContributions || 761} />
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

      <div role="separator" aria-orientation="horizontal" className="my-2 border-b border-border w-full shrink-0" />

      <aside className="w-full">
        <h2 className="text-[9px] uppercase tracking-widest text-muted/80 font-mono font-medium">Connect</h2>
        <section className="mt-2.5 flex flex-col gap-2">
          <LineBox className="w-full">
            <Link
              href="https://github.com/SGOD-pro"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full min-w-0 flex-col gap-0.5 group/link py-1 focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-1 rounded transition-colors"
            >
              <span className="text-muted text-xs tracking-wider uppercase group-hover/link:text-accent font-sans font-semibold transition-colors">
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
              className="flex w-full min-w-0 flex-col gap-0.5 group/link py-1 focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-1 rounded transition-colors"
            >
              <span className="text-muted text-xs tracking-wider uppercase group-hover/link:text-accent font-sans font-semibold transition-colors">
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
              className="flex w-full min-w-0 flex-col gap-0.5 group/link py-1 focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-1 rounded transition-colors"
            >
              <span className="text-muted text-xs tracking-wider uppercase group-hover/link:text-accent font-sans font-semibold transition-colors">
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
              className="flex w-full min-w-0 flex-col gap-0.5 group/link py-1 focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-1 rounded transition-colors"
              title="Open Souvik Karmakar's official Resume in Google Drive"
            >
              <div className="flex items-center justify-between">
                <span className="text-muted text-xs tracking-wider uppercase group-hover/link:text-accent font-sans font-semibold transition-colors">
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
    projectParam && isValidRepoName(projectParam) ? projectParam : null;

  if (isProjectsRoute && sanitizedProject) {
    return <ProjectMetadataSidebar key={sanitizedProject} project={sanitizedProject} />;
  }

  return <DefaultSidebar />;
}

export default function RightSide() {
  return (
    <Suspense fallback={<RightSideLoading />}>
      <RightSideContent />
    </Suspense>
  );
}
