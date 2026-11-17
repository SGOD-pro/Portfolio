"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SafeMarkdown from "@/components/SafeMarkdown";
import type { GitHubRepo, ProjectListResult, GitHubDocument } from "@/lib/github/types";

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
  const [docData, setDocData] = useState<DocResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [retryCount, setRetryCount] = useState(0);

  const docPath = doc === "architecture" ? "architecture" : "README.md";

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
  }, [project, docPath, retryCount]);

  const selectedRepo = allProjects.find((p) => p.name.toLowerCase() === project.toLowerCase());

  return (
    <div className="flex flex-col grow font-mono text-[11px]">
      {/* Command Prompt Breadcrumb */}
      <div className="my-1.5 flex flex-wrap items-center gap-2 text-[11px] font-mono">
        <span className="text-field-placeholder font-bold">souvik@portfolio:~$</span>
        <span className="text-command">
          cat {project}/{doc === "architecture" ? "architecture.md" : "README.md"}
        </span>
        {docData?.isStale && (
          <span className="text-warning text-[10px] ml-auto">[cached snapshot]</span>
        )}
      </div>

      {/* Reader Controls: Back Link, Document Switcher Tabs, Quick Switcher */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Link
            href="/home/projects"
            className="rounded border border-white/15 bg-white/[0.03] px-2.5 py-1 text-[11px] text-muted hover:text-foreground hover:border-white/30 transition flex items-center gap-1.5"
          >
            <span>←</span>
            <span>All Projects</span>
          </Link>

          {/* Quick project switcher pills */}
          {allProjects.length > 1 && (
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-[10px] text-muted">Switch:</span>
              {allProjects.map((p) => {
                const isCurrent = p.name.toLowerCase() === project.toLowerCase();
                return (
                  <Link
                    key={p.name}
                    href={`/home/projects?project=${encodeURIComponent(p.name)}&doc=${doc}`}
                    className={`rounded px-2 py-0.5 text-[10px] transition ${
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
        <div className="flex items-center gap-1.5">
          <Link
            href={`/home/projects?project=${encodeURIComponent(project)}&doc=readme`}
            className={`rounded px-2.5 py-1 text-[11px] transition font-mono ${
              doc !== "architecture"
                ? "border border-accent text-accent bg-accent/20 font-semibold"
                : "border border-white/10 text-muted hover:text-foreground"
            }`}
          >
            README.md
          </Link>
          <Link
            href={`/home/projects?project=${encodeURIComponent(project)}&doc=architecture`}
            className={`rounded px-2.5 py-1 text-[11px] transition font-mono ${
              doc === "architecture"
                ? "border border-accent text-accent bg-accent/20 font-semibold"
                : "border border-white/10 text-muted hover:text-foreground"
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
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
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
  return (
    <div className="relative flex flex-col grow font-mono">
      {/* Command Prompt */}
      <div className="my-1.5 flex items-center gap-2 text-[11px] font-mono">
        <span className="text-field-placeholder font-bold">souvik@portfolio:~$</span>
        <span className="text-command">projects --list</span>
        {projectsData && (
          <span className="text-muted text-[10px] ml-auto hidden sm:inline">
            Mode: <span className="text-accent uppercase font-semibold">[{projectsData.mode}]</span> ·{" "}
            {projectsData.label}
          </span>
        )}
      </div>

      {loading && (
        <div className="grid gap-3 lg:grid-cols-12 mt-2 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="lg:col-span-6 h-36 rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col justify-between"
            >
              <div className="h-4 w-32 bg-white/10 rounded" />
              <div className="h-10 w-full bg-white/5 rounded" />
              <div className="h-4 w-24 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="mt-3 rounded-xl border border-danger/30 bg-danger/10 p-5 text-xs font-mono">
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

      {/* Empty State */}
      {!loading && !error && projectsData && projectsData.projects.length === 0 && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center">
          <p className="text-xs uppercase tracking-wider text-muted font-mono font-medium">
            Repositories Synchronizing
          </p>
          <p className="mt-2 text-xs text-muted max-w-md mx-auto leading-relaxed">
            Public repositories are currently being indexed. You can view all repositories directly
            on GitHub.
          </p>
          <a
            href="https://github.com/SGOD-pro"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 rounded border border-accent/60 bg-accent/15 px-3 py-1.5 text-xs text-accent hover:bg-accent/25 transition"
          >
            View GitHub Profile ↗
          </a>
        </div>
      )}

      {/* Project Cards Grid */}
      {!loading && !error && projectsData && projectsData.projects.length > 0 && (
        <div className="grid gap-3 lg:grid-cols-12 mt-2">
          {projectsData.projects.map((project, index) => (
            <article
              key={project.id || project.name}
              className={`group relative rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-4.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition hover:border-white/20 hover:bg-white/[0.05] flex flex-col justify-between ${
                index === 0 ? "lg:col-span-7" : index === 1 ? "lg:col-span-5" : "lg:col-span-12"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-muted font-mono">
                      repo: {project.fullName || project.name}
                    </p>
                    <h2 className="mt-0.5 text-sm sm:text-base font-semibold tracking-tight text-foreground font-mono">
                      {project.name}
                    </h2>
                  </div>
                  <Link
                    href={`/home/projects?project=${encodeURIComponent(project.name)}&doc=readme`}
                    className="rounded border border-accent/60 bg-accent/15 px-2.5 py-1 text-[11px] text-accent hover:bg-accent/25 transition font-mono cursor-pointer shrink-0"
                  >
                    View Details &amp; Docs ↗
                  </Link>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-muted font-mono">
                  {project.description || "Public repository by @SGOD-pro."}
                </p>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted">
                  <div className="flex items-center gap-2">
                    {project.language && (
                      <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-accent font-mono font-medium">
                        {project.language}
                      </span>
                    )}
                    <span>★ {project.stargazersCount}</span>
                    <span>⑂ {project.forksCount}</span>
                  </div>
                  <span>Updated {formatDate(project.updatedAt)}</span>
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

  const [projectsData, setProjectsData] = useState<ProjectListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = () => {
    let active = true;

    fetch("/api/github/projects")
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json: ProjectListResult) => {
        if (active) {
          setProjectsData(json);
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
  };

  useEffect(() => {
    return fetchProjects();
  }, []);

  // Validate project param against safety regex
  const validProject =
    projectParam && REPO_NAME_REGEX.test(projectParam) ? projectParam : null;

  if (validProject) {
    return (
      <ProjectReaderView
        key={`${validProject}:${docParam}`}
        project={validProject}
        doc={docParam}
        allProjects={projectsData?.projects || []}
      />
    );
  }

  return (
    <ProjectListView
      projectsData={projectsData}
      loading={loading}
      error={error}
      onRetry={fetchProjects}
    />
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
