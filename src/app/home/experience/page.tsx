"use client";

import Link from "next/link";
import { useRef } from "react";
import { useReveal } from "@/hooks/useReveal";
import TextReveal from "@/components/TextReveal";
import TerminalPrompt from "@/components/TerminalPrompt";

const focusAreas = [
  {
    title: "Fullstack Web Engineering",
    period: "2023 – Present",
    description:
      "Developing end-to-end applications with Next.js, React, and TypeScript. Designing modular component systems, server actions, and responsive interfaces optimized for performance.",
    highlights: ["Next.js App Router & Server Components", "Design system implementation with Tailwind", "State management & accessible form design"],
  },
  {
    title: "Applied AI & Retrieval Systems",
    period: "2023 – Present",
    description:
      "Building practical developer tools and retrieval-augmented generation (RAG) pipelines using vector embeddings, OpenAI APIs, and custom parsing workflows.",
    highlights: ["Semantic document indexing & retrieval", "Streaming LLM responses in real-time interfaces", "Prompt engineering & evaluation workflows"],
  },
  {
    title: "Backend Services & API Design",
    period: "2022 – Present",
    description:
      "Designing clean REST and GraphQL endpoints, data models with PostgreSQL and MongoDB, and containerized microservices with Docker.",
    highlights: ["Database schema design & migrations", "Authentication & secure route protection", "Performance profiling and caching strategies"],
  },
];

function Experience() {
  const containerRef = useRef<HTMLDivElement>(null);
  useReveal(containerRef);

  return (
    <div ref={containerRef} className="relative flex flex-col grow">
      {/* Linux prompt at top left */}
      <TerminalPrompt command="experience" />

      <header className="mt-2 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <TextReveal
              text="Experience"
              className="text-2xl sm:text-3xl font-sans font-semibold tracking-tight text-foreground"
            />
            <p data-reveal className="mt-1 text-sm sm:text-base font-sans text-muted leading-relaxed max-w-[65ch]">
              Technical background, engineering project focus, and core developer practices.
            </p>
          </div>
          <div data-reveal className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-success/30 bg-success/10 text-success text-xs font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span>Open for engineering roles</span>
          </div>
        </div>
      </header>

      {/* Experience / Focus Cards */}
      <div className="space-y-4">
        {focusAreas.map((area) => (
          <section
            key={area.title}
            data-reveal
            className="rounded-xl border border-border bg-surface/80 p-5 sm:p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-all duration-150 hover:border-command/40 hover:bg-surface min-w-0"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-border">
              <h2 className="text-lg sm:text-xl font-sans font-semibold text-foreground">
                {area.title}
              </h2>
              <span className="text-xs font-mono text-muted">{area.period}</span>
            </div>

            <p className="mt-3 text-sm font-sans text-muted leading-relaxed max-w-[65ch]">
              {area.description}
            </p>

            <ul className="mt-4 flex flex-wrap gap-2">
              {area.highlights.map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-border bg-surface-secondary/50 px-2.5 py-1 text-xs font-mono text-command"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <footer data-reveal className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border text-xs font-sans text-muted">
        <span>Looking to discuss fullstack or applied AI opportunities?</span>
        <Link
          href="/home/contact"
          className="text-command font-mono hover:underline inline-flex items-center gap-1"
        >
          Get in touch →
        </Link>
      </footer>
    </div>
  );
}

export default Experience;
