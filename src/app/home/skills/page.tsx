"use client";

import { useRef } from "react";
import { useReveal } from "@/hooks/useReveal";
import TextReveal from "@/components/TextReveal";

const skillCategories = [
  {
    title: "Frontend Development",
    description: "Building responsive, accessible web interfaces with modern rendering and motion.",
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "GSAP", "HTML5 / WebGL", "State Machines"],
  },
  {
    title: "Backend & Systems",
    description: "Designing resilient REST & GraphQL APIs, data models, and performant backend services.",
    technologies: ["Node.js", "Python", "Go", "PostgreSQL", "Redis", "MongoDB", "Prisma / ORMs"],
  },
  {
    title: "AI & Machine Learning",
    description: "Implementing retrieval pipelines, LLM-driven workflows, and embedding vector stores.",
    technologies: ["OpenAI API", "PyTorch", "LangChain", "Vector Databases", "RAG Pipelines", "Scikit-learn"],
  },
  {
    title: "DevOps & Tooling",
    description: "Containerization, automated continuous integration, and secure cloud environments.",
    technologies: ["Docker", "Kubernetes", "AWS", "GitHub Actions", "Linux / Shell", "CI/CD Workflows"],
  },
];

function Skills() {
  const containerRef = useRef<HTMLDivElement>(null);
  useReveal(containerRef);

  return (
    <div ref={containerRef} className="relative flex flex-col grow">
      {/* Linux prompt */}
      <div className="my-1.5 flex items-center gap-2 text-xs font-mono" data-reveal>
        <span className="text-field-placeholder font-bold">souvik@portfolio:~$</span>
        <span className="text-command">skills</span>
      </div>

      <header className="mt-1.5 mb-3">
        <TextReveal
          text="Skills & Capabilities"
          className="text-2xl sm:text-3xl font-sans font-semibold tracking-tight text-foreground"
        />
        <p data-reveal className="mt-0.5 text-xs sm:text-sm font-sans text-muted leading-relaxed max-w-[65ch]">
          Core technical competencies, production frameworks, and engineering tools across fullstack and applied AI development.
        </p>
      </header>

      {/* 4 Skill Categories Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {skillCategories.map((group) => (
          <section
            key={group.title}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-4.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] flex flex-col justify-between transition-colors duration-150 hover:border-white/20 hover:bg-white/[0.05] min-w-0"
          >
            <div>
              <h2 className="text-base sm:text-lg font-sans font-semibold text-foreground">
                {group.title}
              </h2>
              <p className="mt-1 text-xs font-sans text-muted leading-relaxed">
                {group.description}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap gap-1.5">
              {group.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-mono text-accent/90"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default Skills;
