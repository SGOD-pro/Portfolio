"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { getLocalCache } from "@/lib/client-cache";
import type { ProjectListResult } from "@/lib/github/types";

interface CommandCandidate {
  name: string;
  type: "command" | "project";
  description: string;
  route: string;
  keywords?: string[];
}

const STATIC_CANDIDATES: CommandCandidate[] = [
  {
    name: "me",
    type: "command",
    description: "About & Overview",
    route: "/home",
    keywords: ["home", "about", "bio", "overview", "intro"],
  },
  {
    name: "skills",
    type: "command",
    description: "Skills & Capabilities",
    route: "/home/skills",
    keywords: ["capabilities", "tech", "stack", "tools", "languages"],
  },
  {
    name: "projects",
    type: "command",
    description: "Projects & Work",
    route: "/home/projects",
    keywords: ["work", "repos", "repositories", "code", "software"],
  },
  {
    name: "experience",
    type: "command",
    description: "Career Timeline",
    route: "/home/experience",
    keywords: ["jobs", "timeline", "history", "career", "roles"],
  },
  {
    name: "achievements",
    type: "command",
    description: "Achievements & Milestones",
    route: "/home/achievements",
    keywords: ["achievements", "awards", "milestones", "honors", "accomplishments", "recognition"],
  },
  {
    name: "contact",
    type: "command",
    description: "Get in Touch",
    route: "/home/contact",
    keywords: ["email", "message", "hire", "reach", "connect"],
  },
  {
    name: "resume",
    type: "command",
    description: "Inspect Resume / CV (PDF)",
    route: "https://drive.google.com/file/d/165G0scNbWuux1aZ_VwSSXlds1Hw2-AL6/view?usp=drive_link",
    keywords: ["cv", "resume", "pdf", "profile", "curriculum", "credentials"],
  },
  // Default verified projects (related work)
  {
    name: "ai-blog-writer",
    type: "project",
    description: "AI Blog Writer",
    route: "/home/projects?project=ai-blog-writer&doc=readme",
    keywords: ["ai", "blog", "writer", "gemini", "agent"],
  },
  {
    name: "recommendation_sys",
    type: "project",
    description: "Movie Recommendation System",
    route: "/home/projects?project=recommendation_sys&doc=readme",
    keywords: ["recommendation", "movie", "ml", "python", "recommender"],
  },
  {
    name: "PingBin",
    type: "project",
    description: "Network Ping Utility",
    route: "/home/projects?project=PingBin&doc=readme",
    keywords: ["ping", "bin", "network", "latency", "tool"],
  },
  {
    name: "OAuth2.1",
    type: "project",
    description: "OAuth 2.1 Security Implementation",
    route: "/home/projects?project=OAuth2.1&doc=readme",
    keywords: ["auth", "security", "token", "login", "oauth"],
  },
  {
    name: "Portfolio",
    type: "project",
    description: "Portfolio Source & Architecture",
    route: "/home/projects?project=Portfolio&doc=readme",
    keywords: ["portfolio", "nextjs", "react", "website"],
  },
];

const NAVIGATION_TABS = ["me", "skills", "projects", "experience", "achievements", "contact"];

function computeProbability(query: string, candidate: CommandCandidate): number {
  const q = query.trim().toLowerCase();
  const name = candidate.name.toLowerCase();

  if (!q) return 0;

  let score = 0;

  // 1. Exact match
  if (q === name) {
    score = 100;
  }
  // 2. Exact prefix match
  else if (name.startsWith(q)) {
    const fraction = q.length / name.length;
    score = Math.min(99, Math.max(78, Math.round(88 + fraction * 11)));
  }
  // 3. Acronym / abbreviation match (e.g. abw for ai-blog-writer, rs for recommendation_sys)
  else {
    const initials = name
      .split(/[-_.\s]/)
      .map((w) => w[0])
      .join("");
    if (initials.startsWith(q)) {
      score = 88;
    }
    // 4. Substring match
    else if (name.includes(q)) {
      const subIndex = name.indexOf(q);
      score = Math.max(68, Math.round(84 - subIndex * 3));
    }
    // 5. Keyword match
    else if (candidate.keywords) {
      for (const kw of candidate.keywords) {
        if (kw === q) {
          score = 86;
          break;
        }
        if (kw.startsWith(q)) {
          score = 80;
          break;
        }
        if (kw.includes(q)) {
          score = 72;
          break;
        }
      }
    }
  }

  // 6. Subsequence match (characters in order) fallback
  if (score === 0) {
    let qIdx = 0;
    for (let i = 0; i < name.length && qIdx < q.length; i++) {
      if (name[i] === q[qIdx]) qIdx++;
    }
    if (qIdx === q.length) {
      score = Math.max(60, Math.round(74 - (name.length - q.length)));
    }
  }

  // Slight priority boost for primary navigation commands
  if (score > 0 && candidate.type === "command") {
    score = Math.min(100, score + 2);
  }

  return score;
}

function getInitialCandidates(): CommandCandidate[] {
  if (typeof window === "undefined") return STATIC_CANDIDATES;
  const cachedProjects = getLocalCache<ProjectListResult>("projects:SGOD-pro");
  if (!cachedProjects || !cachedProjects.projects.length) return STATIC_CANDIDATES;

  const merged = [...STATIC_CANDIDATES];
  for (const p of cachedProjects.projects) {
    if (!merged.some((m) => m.name.toLowerCase() === p.name.toLowerCase())) {
      merged.push({
        name: p.name,
        type: "project",
        description: p.description || "Public repository by @SGOD-pro",
        route: `/home/projects?project=${encodeURIComponent(p.name)}&doc=readme`,
      });
    }
  }
  return merged;
}

function CommandBox() {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const [commandValue, setCommandValue] = useState("");
  const [showError, setShowError] = useState(false);
  const [dynamicCandidates] = useState<CommandCandidate[]>(getInitialCandidates);

  // Global typing listener: immediately activates input on any keystroke
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const activeEl = document.activeElement;
      if (
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement ||
        (activeEl as HTMLElement | null)?.isContentEditable
      ) {
        return;
      }

      if (e.key.length === 1) {
        if (inputRef.current) {
          inputRef.current.focus();
          setCommandValue((prev) => prev + e.key);
          setShowError(false);
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  const trimmedValue = commandValue.trim().toLowerCase();

  const currentRoute = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] !== "home") return "me";
    return segments[1] || "me";
  }, [pathname]);

  // Compute probability-ranked predictions
  const predictions = useMemo(() => {
    if (!trimmedValue) return [];

    const scored = dynamicCandidates
      .map((c) => ({
        ...c,
        probability: computeProbability(trimmedValue, c),
      }))
      .filter((c) => c.probability >= 60)
      .sort((a, b) => b.probability - a.probability);

    return scored;
  }, [trimmedValue, dynamicCandidates]);

  const bestMatch = predictions[0] || null;
  const relatedWork = useMemo(() => {
    if (!predictions.length) return [];
    // Show remaining predictions (up to 3) as related work / alternate suggestions
    return predictions.slice(1, 4);
  }, [predictions]);

  // Inline ghost suggestion logic
  const isPrefixMatch = Boolean(
    bestMatch &&
      bestMatch.name.toLowerCase().startsWith(trimmedValue) &&
      bestMatch.name.toLowerCase() !== trimmedValue
  );

  const suggestionTail = isPrefixMatch && bestMatch
    ? bestMatch.name.slice(trimmedValue.length)
    : "";

  const executeNavigation = (targetName: string, matchedCandidate?: CommandCandidate | null) => {
    const normalized = targetName.trim().toLowerCase();
    if (!normalized) return;

    // Handle clear
    if (normalized === "clear") {
      setCommandValue("");
      setShowError(false);
      return;
    }

    const candidate =
      matchedCandidate ||
      dynamicCandidates.find(
        (c) =>
          c.name.toLowerCase() === normalized ||
          (c.keywords && c.keywords.includes(normalized))
      ) ||
      bestMatch;

    if (candidate) {
      setShowError(false);
      setCommandValue("");
      if (candidate.route.startsWith("http")) {
        window.open(candidate.route, "_blank", "noopener,noreferrer");
      } else {
        router.push(candidate.route);
      }
      return;
    }

    setShowError(true);
  };

  return (
    <div className="w-full flex flex-col py-1">
      {/* Probability Guess & Related Work Indicator */}
      {bestMatch && trimmedValue && (
        <div className="flex flex-wrap items-center gap-2 mb-2 text-[11px] font-mono animate-fadeIn">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-command/15 border border-command/40 text-command font-semibold shadow-[0_0_12px_rgba(156,175,136,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-command animate-ping" />
            <span className="text-muted/80">Guess:</span>
            <span className="text-foreground font-bold">{bestMatch.name}</span>
            <span className="text-command">({bestMatch.probability}%)</span>
            <span className="text-muted/60 text-[9px] uppercase px-1 rounded bg-surface-secondary/60 border border-border">
              {bestMatch.type}
            </span>
          </div>

          <span className="text-muted/70 text-[10px] hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-surface-secondary text-foreground text-[9px] border border-border font-mono">Tab ⇥</kbd> to complete · <kbd className="px-1.5 py-0.5 rounded bg-surface-secondary text-foreground text-[9px] border border-border font-mono">Enter ↵</kbd> to view
          </span>

          {relatedWork.length > 0 && (
            <div className="flex items-center gap-1.5 ml-auto text-[10px]">
              <span className="text-muted/60">Related work:</span>
              {relatedWork.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    setCommandValue(item.name);
                    executeNavigation(item.name, item);
                  }}
                  className="px-1.5 py-0.5 rounded border border-border bg-surface-secondary/40 text-muted hover:text-command hover:border-command/40 hover:bg-command/15 transition-colors cursor-pointer"
                >
                  {item.name} <span className="text-command/80 font-mono">({item.probability}%)</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error alert when command is not recognized */}
      {showError && (
        <div
          role="alert"
          className="mb-2.5 text-xs rounded-md bg-danger/15 border border-danger/40 text-danger px-3 py-1.5 w-fit font-mono"
        >
          Command &quot;{trimmedValue}&quot; not found. Type &quot;help&quot; or try: {STATIC_CANDIDATES.slice(0, 5).map(c => c.name).join(", ")}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] font-mono py-0.5">
        {/* Terminal Input */}
        <div
          className="flex items-center min-w-0 flex-1 cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          <label htmlFor="terminal-nav-input" className="sr-only">
            Terminal command navigation
          </label>
          <span className="text-field-placeholder font-bold shrink-0 select-none mr-2 text-xs font-mono">
            souvik@portfolio:~$
          </span>
          <div className="relative flex-1 min-w-0">
            <input
              ref={inputRef}
              id="terminal-nav-input"
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="w-full relative z-10 bg-transparent text-command placeholder:text-muted/60 focus:outline-none text-xs font-mono py-1 leading-normal"
              placeholder="type command or project (e.g. skills, recommendation_sys)..."
              value={commandValue}
              onChange={(event) => {
                const nextValue = event.target.value;
                setCommandValue(nextValue);
                if (showError) setShowError(false);
              }}
              onKeyDown={(event) => {
                // Tab or ArrowRight fills the best matched prediction completely
                if ((event.key === "Tab" || event.key === "ArrowRight") && bestMatch) {
                  event.preventDefault();
                  setCommandValue(bestMatch.name);
                  return;
                }
                if (event.key === "Enter") {
                  event.preventDefault();
                  executeNavigation(bestMatch ? bestMatch.name : trimmedValue, bestMatch);
                  return;
                }
                if (event.key === "Escape") {
                  setCommandValue("");
                  setShowError(false);
                }
              }}
            />

            {/* Ghost text for autocomplete preview */}
            {isPrefixMatch && suggestionTail && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 flex items-center font-mono text-xs py-1 leading-normal select-none"
              >
                <span className="opacity-0 whitespace-pre">{commandValue}</span>
                <span className="text-command/80 font-medium whitespace-pre">
                  {suggestionTail}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Quick Links */}
        <nav aria-label="Section navigation" className="flex flex-wrap items-center gap-1.5 shrink-0">
          {NAVIGATION_TABS.map((tag) => {
            const isActive = tag === currentRoute;
            const targetRoute = tag === "me" ? "/home" : `/home/${tag}`;
            return (
              <Link
                key={tag}
                href={targetRoute}
                aria-current={isActive ? "page" : undefined}
                className={`rounded px-2.5 py-0.5 text-[10px] sm:text-[11px] transition-all font-mono min-h-[24px] inline-flex items-center justify-center ${
                  isActive
                    ? "border border-command text-command bg-command/20 font-semibold shadow-[0_0_8px_rgba(156,175,136,0.25)]"
                    : "border border-border text-muted hover:text-foreground hover:border-command/40 hover:bg-surface-secondary/40"
                }`}
              >
                {tag}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default CommandBox;
