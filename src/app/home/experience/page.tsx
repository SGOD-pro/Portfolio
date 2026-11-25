"use client";

import Link from "next/link";
import TextReveal from "@/components/TextReveal";
import TerminalPrompt from "@/components/TerminalPrompt";

const experienceTimeline = [
  {
    title: "AI Agent Systems, System Design & Fullstack Web Engineering",
    period: "2026",
    description:
      "Designing and building AI agent systems and agentic workflows alongside end-to-end fullstack web engineering, scalable system design, and automated CI/CD pipelines.",
    highlights: [
      "AI Agent Systems",
      "Agentic Workflows",
      "Fullstack Web Engineering",
      "System Design",
      "CI/CD",
    ],
  },
  {
    title: "AI & Machine Learning",
    period: "2025",
    description:
      "Learned core artificial intelligence and machine learning concepts, model integration, and applied intelligent workflows.",
    highlights: ["Artificial Intelligence", "Machine Learning", "Applied AI Integration"],
  },
  {
    title: "Backend Integration, Docker & Fullstack Development",
    period: "2024",
    description:
      "Integrated backend APIs and services into web applications, learned Docker containerization, and transitioned into fullstack development.",
    highlights: ["Backend Integration", "Docker", "Fullstack Development"],
  },
  {
    title: "Web Development Foundations",
    period: "2023",
    description:
      "Started web development by building responsive interfaces, layouts, and interactive client-side behavior using HTML, CSS, and JavaScript.",
    highlights: ["HTML", "CSS", "JavaScript"],
  },
];

function Experience() {
  return (
    <div className="relative flex flex-col grow">
      {/* Linux prompt at top left */}
      <TerminalPrompt command="experience" />

      <header className="mt-2 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <TextReveal
              text="Experience"
              className="text-2xl sm:text-3xl font-sans font-semibold tracking-tight text-foreground"
            />
            <p className="mt-1 text-sm sm:text-base font-sans text-muted leading-relaxed max-w-[65ch]">
              Progression from web fundamentals in 2023 to fullstack systems, AI/ML, and agentic engineering.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-success/30 bg-success/10 text-success text-xs font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span>Open for engineering roles</span>
          </div>
        </div>
      </header>

      {/* Experience Timeline Cards */}
      <div className="space-y-4">
        {experienceTimeline.map((area) => (
          <section
            key={area.title}
            className="rounded-xl border border-border bg-surface/80 p-5 sm:p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-[background-color,border-color] duration-150 hover:border-command/40 hover:bg-surface min-w-0"
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

      <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border text-xs font-sans text-muted">
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
