"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SafeMarkdown from "@/components/SafeMarkdown";
import type { GitHubRepo, ProjectListResult, GitHubDocument } from "@/lib/github/types";
import { getLocalCache, setLocalCache } from "@/lib/client-cache";
import { useReveal } from "@/hooks/useReveal";
import TextReveal from "@/components/TextReveal";

const REPO_NAME_REGEX = /^[a-zA-Z0-9_.-]+$/;

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

interface DocResponse {
  document: GitHubDocument;
  isStale: boolean;
  fetchedAt: string;
}

// 1. Project Document Reader View
function ProjectReaderView({
  project,
  doc,
  allProjects,
}: {
  project: string;
  doc: string;
  allProjects: GitHubRepo[];
}) {
  const docPath = doc === "architecture" ? "architecture" : "README.md";
  const cacheKey = `doc:${project}:${docPath}`;

  const [docData, setDocData] = useState<DocResponse | null>(() => {
    return getLocalCache<DocResponse>(cacheKey);
  });
  const [loading, setLoading] = useState(() => {
    return !getLocalCache<DocResponse>(cacheKey);
  });
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    fetch(`/api/github/repo/${encodeURIComponent(project)}/doc?path=${encodeURIComponent(docPath)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const err = new Error(body.error || `HTTP ${res.status}`);
          (err as unknown as { status: number }).status = res.status;
          throw err;
        }
        return res.json();
      })
      .then((json: DocResponse) => {
        if (active) {
          setDocData(json);
          setLocalCache(cacheKey, json);
          setLoading(false);
        }
      })
      .catch((err: Error & { status?: number }) => {
        if (active) {
          setErrorStatus(err.status || 500);
          setErrorMessage(err.message);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [project, docPath, retryCount, cacheKey]);

  const containerRef = useRef<HTMLDivElement>(null);
  useReveal(containerRef, [project, doc, docData?.document.path]);

  const selectedRepo = allProjects.find((p) => p.name.toLowerCase() === project.toLowerCase());

  return (
    <div ref={containerRef} className="flex flex-col grow">
      {/* Command Prompt Breadcrumb */}
      <div className="my-1.5 flex flex-wrap items-center gap-2 text-xs font-mono" data-reveal>
        <span className="text-field-placeholder font-bold">souvik@portfolio:~$</span>
        <span className="text-command">
          cat {project}/{doc === "architecture" ? "architecture.md" : "README.md"}
        </span>
        {docData?.isStale && (
          <span className="text-warning text-xs ml-auto font-mono">[cached snapshot]</span>
        )}
      </div>

      {/* Reader Controls: Back Link, Document Switcher Tabs, Quick Switcher */}
      <div data-reveal className="mt-2 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 font-sans text-xs">
        <div className="flex items-center gap-2">
          <Link
            href="/home/projects"
            className="rounded-lg border border-white/15 bg-white/[0.03] px-3 py-1.5 font-medium text-muted hover:text-foreground hover:border-white/30 transition flex items-center gap-1.5"
          >
            <span>←</span>
            <span>All Projects</span>
          </Link>

          {/* Quick project switcher pills */}
          {allProjects.length > 1 && (
            <div className="hidden sm:flex items-center gap-1.5 ml-2">
              <span className="text-xs text-muted">Switch:</span>
              {allProjects.map((p) => {
                const isCurrent = p.name.toLowerCase() === project.toLowerCase();
                return (
                  <Link
                    key={p.name}
                    href={`/home/projects?project=${encodeURIComponent(p.name)}&doc=${doc}`}
                    className={`rounded-md px-2 py-1 text-xs font-mono transition ${
                      isCurrent
                        ? "border border-accent text-accent bg-accent/20 font-semibold"
                        : "border border-white/10 text-muted hover:text-foreground"
                    }`}
                  >
                    {p.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Doc Switcher Tabs */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <Link
            href={`/home/projects?project=${encodeURIComponent(project)}&doc=readme`}
            className={`rounded-lg px-3 py-1.5 transition ${
              doc !== "architecture"
                ? "border border-accent text-accent bg-accent/20 font-semibold"
                : "border border-white/10 text-muted hover:text-foreground hover:bg-white/[0.04]"
            }`}
          >
            README.md
          </Link>
          <Link
            href={`/home/projects?project=${encodeURIComponent(project)}&doc=architecture`}
            className={`rounded-lg px-3 py-1.5 transition ${
              doc === "architecture"
                ? "border border-accent text-accent bg-accent/20 font-semibold"
                : "border border-white/10 text-muted hover:text-foreground hover:bg-white/[0.04]"
            }`}
          >
            Architecture
          </Link>
        </div>
      </div>

      {/* Reader Document Area */}
      <div className="mt-3 flex-1">
        {loading && (
          <div className="space-y-2.5 p-4 rounded-xl border border-white/10 bg-white/[0.02] animate-pulse">
            <div className="h-4 w-48 bg-white/10 rounded" />
            <div className="h-3 w-full bg-white/5 rounded" />
            <div className="h-3 w-5/6 bg-white/5 rounded" />
            <div className="h-20 w-full bg-white/5 rounded mt-3" />
          </div>
        )}

        {/* 404: Confirmed Missing Document */}
        {!loading && errorStatus === 404 && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 text-warning text-xs">
              <span>⚠</span>
              <span className="font-semibold uppercase tracking-wider">
                {doc === "architecture" ? "Architecture Document Not Found" : "README Not Found"}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted leading-relaxed">
              {doc === "architecture"
                ? `No architecture document is published in "${project}". Checked standard locations: architecture.md, docs/architecture.md, docs/atchitecture.md.`
                : `No README file was found in the default branch of "${project}".`}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/home/projects?project=${encodeURIComponent(project)}&doc=readme`}
                className="rounded border border-accent/60 bg-accent/15 px-3 py-1.5 text-xs text-accent hover:bg-accent/25 transition"
              >
                View README.md
              </Link>
              {selectedRepo?.htmlUrl && (
                <a
                  href={selectedRepo.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs text-muted hover:text-foreground transition"
                >
                  View repository on GitHub ↗
                </a>
              )}
            </div>
          </div>
        )}

        {/* 5xx / 403 / 429: API or Upstream Fetch Error */}
        {!loading && errorStatus && errorStatus !== 404 && (
          <div className="rounded-xl border border-danger/30 bg-danger/10 p-5 font-mono text-xs">
            <p className="font-semibold text-danger">Failed to fetch document from GitHub</p>
            <p className="mt-1 text-foreground/80">{errorMessage || "An unexpected error occurred."}</p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setRetryCount((c) => c + 1)}
                className="rounded border border-danger/50 px-3 py-1 text-danger hover:bg-danger/20 transition cursor-pointer"
              >
                Retry Request
              </button>
              {selectedRepo?.htmlUrl && (
                <a
                  href={selectedRepo.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-white/15 px-3 py-1 text-muted hover:text-foreground transition"
                >
                  Inspect on GitHub ↗
                </a>
              )}
            </div>
          </div>
        )}

        {/* Successfully Loaded Document */}
        {!loading && docData && (
          <div data-reveal className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <SafeMarkdown
              content={docData.document.content}
              repo={project}
              branch={selectedRepo?.defaultBranch || "main"}
              docPath={docData.document.path}
              htmlUrl={docData.document.htmlUrl}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// 2. Project List / Selector View
function ProjectListView({
  projectsData,
  loading,
  error,
  onRetry,
}: {
  projectsData: ProjectListResult | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  useReveal(containerRef, [loading]);

  return (
    <div ref={containerRef} className="relative flex flex-col grow">
      {/* Linux prompt */}
      <div className="my-1.5 flex items-center gap-2 text-xs font-mono">
        <span className="text-field-placeholder font-bold">souvik@portfolio:~$</span>
        <span className="text-command">projects</span>
        {projectsData && (
          <span className="text-muted text-[10px] ml-auto hidden sm:inline font-mono">
            Mode: <span className="text-accent uppercase font-semibold">[{projectsData.mode}]</span> ·{" "}
            {projectsData.label}
          </span>
        )}
      </div>

      <header className="mt-2 mb-6">
        <TextReveal
          text="Projects & Work"
          className="text-2xl sm:text-3xl font-sans font-semibold tracking-tight text-foreground"
          delay={0.16}
          stagger={0.02}
        />
        <p data-reveal className="mt-1 text-sm sm:text-base font-sans text-muted leading-relaxed max-w-[65ch]">
          Selected software repositories, verified documentation, and architectural designs.
        </p>
      </header>

      {loading && (
        <div className="grid gap-4 lg:grid-cols-2 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-44 rounded-xl border border-white/10 bg-white/[0.02] p-5 flex flex-col justify-between"
            >
              <div className="h-5 w-40 bg-white/10 rounded" />
              <div className="h-12 w-full bg-white/5 rounded" />
              <div className="h-4 w-32 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 p-5 text-xs font-mono">
          <p className="font-semibold text-danger">Failed to retrieve projects list</p>
          <p className="mt-1 text-foreground/80">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded border border-danger/50 px-3 py-1 text-danger hover:bg-danger/20 transition cursor-pointer"
          >
            Retry Request
          </button>
        </div>
      )}

      {/* Honest Empty State */}
      {!loading && !error && projectsData && projectsData.projects.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center" data-reveal>
          <p className="text-sm font-sans font-medium text-foreground">
            No Public Repositories Found
          </p>
          <p className="mt-2 text-sm text-muted max-w-md mx-auto leading-relaxed font-sans">
            No public repositories are currently listed for this account. You can view all profile
            activity directly on GitHub.
          </p>
          <a
            href="https://github.com/SGOD-pro"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 rounded-lg border border-accent/60 bg-accent/15 px-4 py-2 text-xs text-accent hover:bg-accent/25 transition font-mono"
          >
            View GitHub Profile ↗
          </a>
        </div>
      )}

      {/* Project Cards Grid */}
      {!loading && !error && projectsData && projectsData.projects.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {projectsData.projects.map((project) => (
            <article
              key={project.name}
              className="group relative rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-colors duration-150 hover:border-white/20 hover:bg-white/[0.05] flex flex-col justify-between min-w-0"
            >
              <div>
                <p className="text-xs font-mono text-muted/70">
                  {project.fullName || project.name}
                </p>
                <h2 className="mt-1 text-xl sm:text-2xl font-sans font-semibold text-foreground tracking-tight">
                  {project.name}
                </h2>

                <p className="mt-2.5 text-sm sm:text-base font-sans text-muted leading-relaxed">
                  {project.description || "Public software repository maintained by @SGOD-pro."}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-mono text-muted">
                  {project.language && (
                    <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-accent font-medium">
                      {project.language}
                    </span>
                  )}
                  <span>★ {project.stargazersCount}</span>
                  <span>Updated {formatDate(project.updatedAt)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/home/projects?project=${encodeURIComponent(project.name)}&doc=readme`}
                    className="rounded-lg bg-accent text-accent-foreground px-3 py-1.5 text-xs font-sans font-medium hover:opacity-95 transition shadow-[0_2px_8px_rgba(180,96,4,0.25)] cursor-pointer"
                  >
                    Inspect Project &amp; Docs ↗
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// 3. Main Projects Page Orchestrator
function ProjectsContent() {
  const searchParams = useSearchParams();
  const projectParam = searchParams.get("project");
  const docParam = searchParams.get("doc") || "readme";

  const [projectsData, setProjectsData] = useState<ProjectListResult | null>(() => {
    return getLocalCache<ProjectListResult>("projects:SGOD-pro");
  });
  const [loading, setLoading] = useState(() => {
    return !getLocalCache<ProjectListResult>("projects:SGOD-pro");
  });
  const [error, setError] = useState<string | null>(null);
  const activeRequestIdRef = React.useRef(0);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const requestProjects = React.useCallback((controller: AbortController, reqId: number) => {
    fetch("/api/github/projects", { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json: ProjectListResult) => {
        if (reqId === activeRequestIdRef.current) {
          if (json.error && (!json.projects || json.projects.length === 0)) {
            setError(json.error);
          } else {
            setProjectsData(json);
            setLocalCache("projects:SGOD-pro", json);
            setError(null);
          }
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        if (reqId === activeRequestIdRef.current) {
          setError(err.message || "Failed to load projects");
          setLoading(false);
        }
      });
  }, []);

  const handleRetry = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const reqId = ++activeRequestIdRef.current;
    setError(null);
    setLoading(true);
    requestProjects(controller, reqId);
  };

  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const reqId = ++activeRequestIdRef.current;
    requestProjects(controller, reqId);

    return () => {
      controller.abort();
    };
  }, [requestProjects]);

  // Validate project param against safety regex
  const validProject =
    projectParam && REPO_NAME_REGEX.test(projectParam) ? projectParam : null;

  if (validProject) {
    return (
      <div className="w-full min-w-0 min-h-full flex flex-col grow">
        <ProjectReaderView
          key={`${validProject}:${docParam}`}
          project={validProject}
          doc={docParam}
          allProjects={projectsData?.projects || []}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 min-h-full flex flex-col grow">
      <ProjectListView
        projectsData={projectsData}
        loading={loading}
        error={error}
        onRetry={handleRetry}
      />
    </div>
  );
}

export default function Projects() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col grow p-4 font-mono text-xs text-muted animate-pulse">
          Loading project telemetry...
        </div>
      }
    >
      <ProjectsContent />
    </Suspense>
  );
}
