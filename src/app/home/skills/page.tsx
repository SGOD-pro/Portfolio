"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextReveal from "@/components/TextReveal";
import TerminalPrompt from "@/components/TerminalPrompt";
import AnimatedNumber from "@/components/AnimatedNumber";
import { useGitHubStore } from "@/lib/store";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

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

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  category: "Hackathon" | "Course Completion" | "Professional Certification";
  recipient: string;
  date: string;
  fileName: string;
  fileSize: string;
  credentialId?: string;
  description: string;
  skills: string[];
  pdfUrl?: string;
}

const RESUME_URL =
  "https://drive.google.com/file/d/165G0scNbWuux1aZ_VwSSXlds1Hw2-AL6/view?usp=drive_link";

const CERTIFICATES: Certificate[] = [
  {
    id: "team-bro-code",
    title: "Team Bro Code — National Hackathon Finalist",
    issuer: "National Hackathon Summit",
    category: "Hackathon",
    recipient: "Souvik Karmakar",
    date: "Aug 2024",
    fileName: "09-TEAM-BRO-CODE.pdf",
    fileSize: "3.1 MB",
    pdfUrl:
      "https://drive.google.com/file/d/1_mdVutDZt_Gb-jvnJCBgWcB-rgyquO9K/view?usp=drive_link",
    description:
      "Engineered collaborative multi-tenant fullstack architecture under 24-hour hackathon constraints with real-time sync.",
    skills: ["Real-time Systems", "System Architecture", "Hackathon Finalist"],
  },
  {
    id: "hta-gdg",
    title: "Hack the App (HTA) — GDG Hackathon",
    issuer: "Google Developer Groups (GDG)",
    category: "Hackathon",
    recipient: "Souvik Karmakar",
    date: "Aug 2024",
    fileName: "hta-gdg-certificate-souvik_karmakar (1).pdf",
    fileSize: "16 KB",
    pdfUrl:
      "https://drive.google.com/file/d/1mWHtS5A7mGEs-t9Anwf8GHbWSv4XLnkA/view?usp=drive_link",
    description:
      "Awarded by Google Developer Groups (GDG) for engineering competition excellence and rapid prototype development in Hack the App.",
    skills: ["Fullstack Architecture", "API Integration", "Fast Prototyping", "GDG Hackathon"],
  },
  {
    id: "konverge",
    title: "Konverge Tech Hackathon & Innovation",
    issuer: "Konverge Technical Fest",
    category: "Hackathon",
    recipient: "Souvik Karmakar",
    date: "Aug 2024",
    fileName: "Konverge_Certificate_668602 (1).pdf",
    fileSize: "301 KB",
    credentialId: "668602",
    pdfUrl:
      "https://drive.google.com/file/d/1weaQ7TXa5qtVFpC2GiWVGuru-vEmS6lT/view?usp=drive_link",
    description:
      "Competitive hackathon award for scalable software system architecture, component modularity, and applied developer tooling.",
    skills: ["Component Systems", "Modular Architecture", "Technical Delivery"],
  },
  {
    id: "launched-course",
    title: "LaunchED Fullstack & Systems Course Completion",
    issuer: "LaunchED Technical Academy",
    category: "Course Completion",
    recipient: "Souvik Karmakar",
    date: "2024",
    fileName: "LanchED course completion.pdf",
    fileSize: "251 KB",
    pdfUrl:
      "https://drive.google.com/file/d/1k6gIVKhC5p7LCj84Rt5RZERuAn2vAx5y/view?usp=drive_link",
    description:
      "Rigorous technical course completion curriculum covering advanced TypeScript, distributed systems concepts, and production cloud pipelines.",
    skills: ["Fullstack Web Development", "Advanced TypeScript", "Cloud Deployment"],
  },
  {
    id: "launchpaded",
    title: "LaunchpadED Developer Engineering Certification",
    issuer: "LaunchpadED Accreditation",
    category: "Professional Certification",
    recipient: "Souvik Karmakar",
    date: "2024",
    fileName: "LanchpadED.pdf",
    fileSize: "750 KB",
    pdfUrl:
      "https://drive.google.com/file/d/1pRZvD_DIrCO43jc0wBblyVWA40bH_1Qz/view?usp=drive_link",
    description:
      "Professional accreditation verifying engineering proficiency in frontend performance, type-safe APIs, and responsive design systems.",
    skills: ["Frontend Engineering", "Type Safety", "Performance Optimization"],
  },
];

export default function SkillsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const achievementsHeaderRef = useRef<HTMLDivElement>(null);
  const achievementsSubRef = useRef<HTMLDivElement>(null);
  const topCardsContainerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const [activeCategory, setActiveCategory] = useState<"all" | "hackathons" | "courses">("all");
  const profile = useGitHubStore((s) => s.profile);
  const fetchProfile = useGitHubStore((s) => s.fetchProfile);

  useEffect(() => {
    fetchProfile();
    const scroller = document.querySelector<HTMLElement>(".terminal-scrollbar");
    if (scroller) {
      scroller.scrollTop = 0;
    }
  }, [fetchProfile]);

  const filteredCerts = CERTIFICATES.filter((cert) => {
    if (activeCategory === "hackathons") return cert.category === "Hackathon";
    if (activeCategory === "courses")
      return cert.category === "Course Completion" || cert.category === "Professional Certification";
    return true;
  });

  // GSAP ScrollTrigger for Achievements Header, Top Cards, and Individual Credential Cards
  useGSAP(
    () => {
      if (typeof window === "undefined") return;
      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (isReduced) return;

      const scrollerEl = document.querySelector(".terminal-scrollbar") || window;

      // 1. Achievements Header Elements Fade-In with ScrollTrigger
      if (achievementsHeaderRef.current) {
        const kicker = achievementsHeaderRef.current.querySelector(".achievements-kicker");
        const desc = achievementsHeaderRef.current.querySelector(".achievements-desc");

        if (kicker) {
          gsap.fromTo(
            kicker,
            { opacity: 0, y: 8 },
            {
              opacity: 1,
              y: 0,
              duration: 0.35,
              ease: "power2.out",
              scrollTrigger: {
                trigger: achievementsHeaderRef.current,
                scroller: scrollerEl,
                start: "top 88%",
                toggleActions: "play none none none",
              },
            }
          );
        }

        if (desc) {
          gsap.fromTo(
            desc,
            { opacity: 0, y: 10 },
            {
              opacity: 1,
              y: 0,
              duration: 0.45,
              delay: 0.12,
              ease: "power2.out",
              scrollTrigger: {
                trigger: achievementsHeaderRef.current,
                scroller: scrollerEl,
                start: "top 88%",
                toggleActions: "play none none none",
              },
            }
          );
        }
      }

      // 2. Achievements Subtitle and Action Controls Fade-In with ScrollTrigger
      if (achievementsSubRef.current) {
        gsap.fromTo(
          achievementsSubRef.current,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            delay: 0.14,
            ease: "power2.out",
            scrollTrigger: {
              trigger: achievementsSubRef.current,
              scroller: scrollerEl,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // 3. Top Overview Stat Badges (Image 3) - Revels fade in ONE BY ONE
      if (topCardsContainerRef.current) {
        const statCards = topCardsContainerRef.current.querySelectorAll(".stat-card");
        if (statCards && statCards.length > 0) {
          gsap.fromTo(
            statCards,
            { opacity: 0, y: 22 },
            {
              opacity: 1,
              y: 0,
              duration: 0.45,
              stagger: 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: topCardsContainerRef.current,
                scroller: scrollerEl,
                start: "top 88%",
                toggleActions: "play none none none",
              },
            }
          );
        }
      }

      // 4. Certificate & Credential Cards (Image 4) - Individual revealing animation for each card when in view
      if (cardsContainerRef.current) {
        const cards = cardsContainerRef.current.querySelectorAll(".achievement-card");
        if (cards && cards.length > 0) {
          cards.forEach((card) => {
            gsap.fromTo(
              card,
              { opacity: 0, y: 26 },
              {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: card,
                  scroller: scrollerEl,
                  start: "top 90%",
                  toggleActions: "play none none none",
                },
              }
            );
          });
        }
      }

      // Refresh ScrollTrigger after DOM setup
      ScrollTrigger.refresh();
    },
    { scope: containerRef, dependencies: [filteredCerts] }
  );

  return (
    <div ref={containerRef} className="relative flex flex-col grow">
      {/* Linux prompt at top */}
      <TerminalPrompt command="skills" args="--with-achievements" />

      {/* Skills Section Header */}
      <header className="mt-1.5 mb-4">
        <TextReveal
          text="Skills & Capabilities"
          className="text-2xl sm:text-3xl font-sans font-semibold tracking-tight text-foreground"
        />
        <p className="mt-1 text-xs sm:text-sm font-sans text-muted leading-relaxed max-w-[65ch]">
          Core technical competencies, production frameworks, and engineering tools across fullstack and applied AI development.
        </p>
      </header>

      {/* 4 Skill Categories Grid */}
      <div className="grid gap-3.5 sm:grid-cols-2">
        {skillCategories.map((group) => (
          <section
            key={group.title}
            className="rounded-xl border border-border bg-surface/80 p-4 sm:p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] flex flex-col justify-between transition-[background-color,border-color] duration-150 hover:border-command/40 hover:bg-surface min-w-0"
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

      {/* =========================================================================
          MERGED ACHIEVEMENTS & CREDENTIALS SECTION (With ScrollTrigger animations)
          ========================================================================= */}
      <section id="achievements" className="mt-12 pt-8 border-t border-border/80">
        <div ref={achievementsHeaderRef} className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="mb-1">
                <span className="achievements-kicker text-xs font-mono uppercase tracking-widest text-command font-semibold inline-block">
                  Credentials &amp; Awards
                </span>
              </div>
              <TextReveal
                text="Achievements"
                as="h2"
                scrollTrigger={true}
                className="text-2xl sm:text-3xl font-sans font-semibold tracking-tight text-foreground"
              />
              <p className="achievements-desc mt-1 text-xs sm:text-sm font-sans text-muted leading-relaxed max-w-[65ch]">
                Verified hackathon awards, official course completion accreditations, and engineering credentials for Souvik Karmakar.
              </p>
            </div>

            {/* Resume Button + Filter Tabs */}
            <div ref={achievementsSubRef} className="flex flex-wrap items-center gap-2">
              <a
                href={RESUME_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-command/40 bg-command/15 px-3 py-1.5 text-xs font-mono text-command hover:bg-command/25 hover:border-command transition shadow-[0_2px_10px_rgba(156,175,136,0.15)] cursor-pointer font-medium"
              >
                <span>Inspect Resume (PDF)</span>
                <span>↗</span>
              </a>

              <div className="flex items-center gap-1 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setActiveCategory("all")}
                  className={`px-3 py-1 rounded-lg border transition cursor-pointer ${
                    activeCategory === "all"
                      ? "border-command bg-command/20 text-command font-semibold"
                      : "border-border text-muted hover:text-foreground"
                  }`}
                >
                  All ({CERTIFICATES.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory("hackathons")}
                  className={`px-3 py-1 rounded-lg border transition cursor-pointer ${
                    activeCategory === "hackathons"
                      ? "border-command bg-command/20 text-command font-semibold"
                      : "border-border text-muted hover:text-foreground"
                  }`}
                >
                  Hackathons (3)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory("courses")}
                  className={`px-3 py-1 rounded-lg border transition cursor-pointer ${
                    activeCategory === "courses"
                      ? "border-command bg-command/20 text-command font-semibold"
                      : "border-border text-muted hover:text-foreground"
                  }`}
                >
                  Courses (2)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stat Badges with AnimatedNumber (Top Cards - Image 3) */}
        <div ref={topCardsContainerRef} className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
          <div className="stat-card rounded-xl border border-border bg-surface/60 backdrop-blur-sm p-3 font-mono">
            <span className="text-[10px] uppercase text-muted tracking-wider block">Contributions</span>
            <span className="text-lg sm:text-xl font-bold text-command">
              <AnimatedNumber value={profile?.totalContributions || 761} suffix="+" scrollTrigger={true} />
            </span>
            <span className="text-[10px] text-muted/70 block mt-0.5">Verified activity</span>
          </div>
          <div className="stat-card rounded-xl border border-border bg-surface/60 backdrop-blur-sm p-3 font-mono">
            <span className="text-[10px] uppercase text-muted tracking-wider block">Verified Credentials</span>
            <span className="text-lg sm:text-xl font-bold text-foreground">
              <AnimatedNumber value={CERTIFICATES.length} scrollTrigger={true} />
            </span>
            <span className="text-[10px] text-muted/70 block mt-0.5">Hackathons &amp; courses</span>
          </div>
          <div className="stat-card rounded-xl border border-border bg-surface/60 backdrop-blur-sm p-3 font-mono">
            <span className="text-[10px] uppercase text-muted tracking-wider block">Core Systems</span>
            <span className="text-lg sm:text-xl font-bold text-success">
              <AnimatedNumber value={5} suffix="+" scrollTrigger={true} />
            </span>
            <span className="text-[10px] text-muted/70 block mt-0.5">Engineered repos</span>
          </div>
          <div className="stat-card rounded-xl border border-border bg-surface/60 backdrop-blur-sm p-3 font-mono">
            <span className="text-[10px] uppercase text-muted tracking-wider block">Type Safety</span>
            <span className="text-lg sm:text-xl font-bold text-foreground">
              <AnimatedNumber value={100} suffix="%" scrollTrigger={true} />
            </span>
            <span className="text-[10px] text-muted/70 block mt-0.5">Strict TypeScript</span>
          </div>
        </div>

        {/* Achievement Cards Grid */}
        <div ref={cardsContainerRef} className="grid gap-3.5 sm:grid-cols-2">
          {filteredCerts.map((cert) => (
            <a
              key={cert.id}
              href={cert.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="achievement-card group rounded-xl border border-border bg-surface/80 backdrop-blur-md p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col justify-between transition-[background-color,border-color] duration-150 hover:border-command/40 hover:bg-surface min-w-0 cursor-pointer text-left block"
              title={`Open ${cert.title} in Google Drive`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-border font-mono text-[10px]">
                  <span className="rounded px-2 py-0.5 bg-command/15 border border-command/40 text-command font-semibold uppercase">
                    {cert.category}
                  </span>
                  <span className="text-muted/70">{cert.date}</span>
                </div>

                <div className="mt-2.5 flex items-start justify-between gap-2">
                  <h3 className="text-base font-sans font-semibold text-foreground tracking-tight group-hover:text-command transition-colors">
                    {cert.title}
                  </h3>
                  <span className="text-command/70 group-hover:text-command text-sm font-mono transition-colors shrink-0 mt-0.5">
                    ↗
                  </span>
                </div>

                <p className="mt-1 text-xs text-command font-mono">
                  Issuer: {cert.issuer}
                </p>

                <p className="mt-2 text-xs font-sans text-muted leading-relaxed">
                  {cert.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {cert.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded border border-border bg-surface-secondary/40 px-2 py-0.5 text-[10px] font-mono text-muted"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted/80">
                  <span className="truncate max-w-[180px] sm:max-w-[220px]" title={cert.fileName}>
                    {cert.fileName}
                  </span>
                  <span className="text-muted/40">({cert.fileSize})</span>
                </div>

                <div className="inline-flex items-center gap-1 text-[11px] font-mono text-command group-hover:underline">
                  <span>Drive PDF</span>
                  <span>↗</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
