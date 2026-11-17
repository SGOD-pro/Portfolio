"use client";

import { useRef } from "react";
import { useReveal } from "@/hooks/useReveal";
import TextReveal from "@/components/TextReveal";
import TerminalPrompt from "@/components/TerminalPrompt";

interface SkillItem {
  name: string;
  level: number;
  color: string;
}

interface SkillCategory {
  title: string;
  description: string;
  skills: SkillItem[];
}

const skillCategories: SkillCategory[] = [
  {
    title: "Frontend Development",
    description: "Building responsive, accessible web interfaces with modern rendering, type safety, and motion.",
    skills: [
      { name: "Next.js", level: 94, color: "#E2E8F0" },
      { name: "React", level: 95, color: "#00D8FE" },
      { name: "TypeScript", level: 92, color: "#3178C6" },
      { name: "Tailwind CSS", level: 96, color: "#38BDF8" },
      { name: "GSAP", level: 88, color: "#0AE448" },
      { name: "HTML5 / WebGL", level: 90, color: "#E44D26" },
      { name: "State Machines", level: 84, color: "#A855F7" },
    ],
  },
  {
    title: "Backend & Systems",
    description: "Designing resilient REST & GraphQL APIs, data models, and performant backend services.",
    skills: [
      { name: "Node.js", level: 94, color: "#5FA04E" },
      { name: "Python", level: 90, color: "#3776AB" },
      { name: "Go", level: 82, color: "#00ADD8" },
      { name: "PostgreSQL", level: 90, color: "#336791" },
      { name: "Redis", level: 86, color: "#DC382D" },
      { name: "MongoDB", level: 88, color: "#47A248" },
      { name: "Prisma / ORMs", level: 92, color: "#5A67D8" },
    ],
  },
  {
    title: "AI & Machine Learning",
    description: "Implementing retrieval pipelines, LLM-driven workflows, and embedding vector stores.",
    skills: [
      { name: "OpenAI API", level: 94, color: "#10A37F" },
      { name: "PyTorch", level: 85, color: "#EE4C2C" },
      { name: "LangChain", level: 90, color: "#2DBA4E" },
      { name: "Vector Databases", level: 88, color: "#8B5CF6" },
      { name: "RAG Pipelines", level: 92, color: "#F59E0B" },
      { name: "Scikit-learn", level: 84, color: "#F97316" },
    ],
  },
  {
    title: "DevOps & Tooling",
    description: "Containerization, automated continuous integration, and secure cloud environments.",
    skills: [
      { name: "Docker", level: 90, color: "#2496ED" },
      { name: "Kubernetes", level: 82, color: "#326CE5" },
      { name: "AWS", level: 85, color: "#FF9900" },
      { name: "GitHub Actions", level: 92, color: "#2088FF" },
      { name: "Linux / Shell", level: 94, color: "#4ADE80" },
      { name: "CI/CD Workflows", level: 88, color: "#14B8A6" },
    ],
  },
];

function Skills() {
  const containerRef = useRef<HTMLDivElement>(null);
  useReveal(containerRef);

  return (
    <div ref={containerRef} className="relative flex flex-col grow">
      {/* Linux prompt at top */}
      <TerminalPrompt command="skills" />

      <header className="mt-1.5 mb-4">
        <TextReveal
          text="Skills & Capabilities"
          className="text-2xl sm:text-3xl font-sans font-semibold tracking-tight text-foreground"
        />
        <p data-reveal className="mt-1 text-xs sm:text-sm font-sans text-muted leading-relaxed max-w-[65ch]">
          Core technical competencies, production frameworks, and engineering tools across fullstack and applied AI development.
        </p>
      </header>

      {/* 4 Skill Categories Grid */}
      <div className="grid gap-3.5 sm:grid-cols-2">
        {skillCategories.map((group) => (
          <section
            key={group.title}
            data-reveal
            className="rounded-xl border border-border bg-surface/80 p-4 sm:p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] flex flex-col justify-between transition-all duration-150 hover:border-command/40 hover:bg-surface min-w-0"
          >
            <div>
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-border">
                <h2 className="text-base sm:text-lg font-sans font-semibold text-foreground">
                  {group.title}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-border bg-surface-secondary/40 text-muted">
                  {group.skills.length} competencies
                </span>
              </div>
              <p className="mt-2 text-xs font-sans text-muted leading-relaxed">
                {group.description}
              </p>
            </div>

            {/* Proficiency Progress Bars */}
            <div className="mt-3.5 pt-3 border-t border-border flex flex-col gap-2.5">
              {group.skills.map((skill) => (
                <div key={skill.name} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-foreground/90 font-medium flex items-center gap-1.5 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: skill.color,
                          boxShadow: `0 0 6px ${skill.color}60`,
                        }}
                      />
                      <span className="truncate">{skill.name}</span>
                    </span>
                    <span className="text-muted/80 text-[11px] font-semibold shrink-0">
                      {skill.level}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-secondary/70 overflow-hidden border border-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${skill.level}%`,
                        backgroundColor: skill.color,
                        boxShadow: `0 0 8px ${skill.color}40`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default Skills;
