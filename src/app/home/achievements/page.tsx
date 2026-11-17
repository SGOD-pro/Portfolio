"use client";

import Link from "next/link";
import { useRef } from "react";
import { useReveal } from "@/hooks/useReveal";
import TextReveal from "@/components/TextReveal";

interface Achievement {
  title: string;
  category: string;
  badge: string;
  date: string;
  description: string;
  metrics: string[];
  link?: {
    label: string;
    href: string;
  };
}

const ACHIEVEMENTS: Achievement[] = [
  {
    title: "830+ Public GitHub Contributions",
    category: "Open Source Cadence",
    badge: "Active",
    date: "Past Year",
    description:
      "Maintained a continuous daily engineering streak across fullstack web applications, applied AI agents, and open-source systems utilities under @SGOD-pro.",
    metrics: ["830+ verified commits & PRs", "Daily engineering cadence", "Public repository artifacts"],
    link: {
      label: "Inspect GitHub Activity ↗",
      href: "https://github.com/SGOD-pro",
    },
  },
  {
    title: "Applied AI & Agentic Systems Architecture",
    category: "Artificial Intelligence",
    badge: "Deployed",
    date: "2024",
    description:
      "Architected and deployed autonomous content generation systems with Gemini models and modular prompt orchestration pipelines (ai-blog-writer).",
    metrics: ["Multi-stage LLM pipelines", "Automated markdown publishing", "Zero-hallucination guardrails"],
    link: {
      label: "Inspect ai-blog-writer ↗",
      href: "/home/projects?project=ai-blog-writer&doc=readme",
    },
  },
  {
    title: "Movie Recommendation & Filtering Engine",
    category: "Machine Learning",
    badge: "Production",
    date: "2024",
    description:
      "Built a content-based recommendation engine leveraging cosine similarity matrices, feature vectorization, and Python data structures for real-time inference.",
    metrics: ["Vector cosine similarity", "Sub-100ms inference time", "Clean architecture separation"],
    link: {
      label: "Inspect recommendation_sys ↗",
      href: "/home/projects?project=recommendation_sys&doc=readme",
    },
  },
  {
    title: "OAuth 2.1 Security & Token Lifecycle Engine",
    category: "Security & Protocols",
    badge: "Verified",
    date: "2024",
    description:
      "Engineered an RFC-compliant OAuth 2.1 authorization server implementation with Proof Key for Code Exchange (PKCE), token refresh lifecycle, and cryptographic verification.",
    metrics: ["PKCE protocol enforcement", "Zero-leak token management", "Strict scope & grant validation"],
    link: {
      label: "Inspect OAuth2.1 ↗",
      href: "/home/projects?project=OAuth2.1&doc=readme",
    },
  },
  {
    title: "High-Performance Liquid Glass Architecture",
    category: "Frontend & Performance",
    badge: "Sub-100ms",
    date: "2026",
    description:
      "Engineered a production portfolio achieving 60 FPS GSAP kinetic transitions, dynamic Three.js canvas fallbacks, WCAG AA accessibility, and zero dropped frames.",
    metrics: ["60 FPS kinetic typography", "Zero layout thrashing", "WCAG AA contrast compliant"],
    link: {
      label: "Inspect Portfolio Architecture ↗",
      href: "/home/projects?project=Portfolio&doc=architecture",
    },
  },
];

export default function AchievementsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useReveal(containerRef);

  return (
    <div ref={containerRef} className="relative flex flex-col grow">
      {/* Linux prompt */}
      <div className="my-1.5 flex items-center gap-2 text-xs font-mono" data-reveal>
        <span className="text-field-placeholder font-bold">souvik@portfolio:~$</span>
        <span className="text-command">achievements</span>
        <span className="text-muted text-[10px] ml-auto hidden sm:inline font-mono">
          Status: <span className="text-accent uppercase font-semibold">[VERIFIED]</span> · Public Milestones
        </span>
      </div>

      <header className="mt-2 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <TextReveal
              text="Achievements & Milestones"
              className="text-2xl sm:text-3xl font-sans font-semibold tracking-tight text-foreground"
              delay={0.16}
              stagger={0.02}
            />
            <p data-reveal className="mt-1 text-sm sm:text-base font-sans text-muted leading-relaxed max-w-[65ch]">
              Verified technical milestones, open-source engineering cadence, and applied software deliveries.
            </p>
          </div>

          <div
            data-reveal
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-mono"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
            <span>Continuous delivery</span>
          </div>
        </div>
      </header>

      {/* Overview Stat Badges */}
      <div data-reveal className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 font-mono">
          <span className="text-[10px] uppercase text-muted tracking-wider block">Contributions</span>
          <span className="text-lg sm:text-xl font-bold text-accent">830+</span>
          <span className="text-[10px] text-muted/70 block mt-0.5">Past year activity</span>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 font-mono">
          <span className="text-[10px] uppercase text-muted tracking-wider block">Core Systems</span>
          <span className="text-lg sm:text-xl font-bold text-foreground">5+</span>
          <span className="text-[10px] text-muted/70 block mt-0.5">Engineered repos</span>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 font-mono">
          <span className="text-[10px] uppercase text-muted tracking-wider block">Frame Budget</span>
          <span className="text-lg sm:text-xl font-bold text-success">60 FPS</span>
          <span className="text-[10px] text-muted/70 block mt-0.5">&lt;16.6ms render time</span>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 font-mono">
          <span className="text-[10px] uppercase text-muted tracking-wider block">Standards</span>
          <span className="text-lg sm:text-xl font-bold text-foreground">100%</span>
          <span className="text-[10px] text-muted/70 block mt-0.5">Type-safe TypeScript</span>
        </div>
      </div>

      {/* Milestone Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {ACHIEVEMENTS.map((item) => (
          <article
            key={item.title}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-colors duration-150 hover:border-white/20 hover:bg-white/[0.05] flex flex-col justify-between min-w-0"
          >
            <div>
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10 font-mono text-xs">
                <span className="text-accent font-medium text-[11px] uppercase tracking-wider">
                  {item.category}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-muted/70 text-[10px]">{item.date}</span>
                  <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold bg-accent/20 border border-accent/40 text-accent">
                    {item.badge}
                  </span>
                </div>
              </div>

              <h2 className="mt-3 text-lg sm:text-xl font-sans font-semibold text-foreground tracking-tight">
                {item.title}
              </h2>

              <p className="mt-2 text-sm font-sans text-muted leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <ul className="flex flex-wrap gap-1.5">
                {item.metrics.map((metric) => (
                  <li
                    key={metric}
                    className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-mono text-muted"
                  >
                    {metric}
                  </li>
                ))}
              </ul>

              {item.link && (
                <Link
                  href={item.link.href}
                  className="rounded-lg bg-accent text-accent-foreground px-3 py-1.5 text-xs font-sans font-medium hover:opacity-95 transition shadow-[0_2px_8px_rgba(180,96,4,0.25)] shrink-0"
                >
                  {item.link.label}
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>

      <footer data-reveal className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-sans text-muted">
        <span>Want to inspect full repository architecture and source code?</span>
        <Link
          href="/home/projects"
          className="text-accent font-mono hover:underline inline-flex items-center gap-1"
        >
          View all projects →
        </Link>
      </footer>
    </div>
  );
}
