"use client";

import TransitionLink from "@/components/TransitionLink";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGitHubStore } from "@/lib/store";
import TextReveal from "@/components/TextReveal";
import AnimatedNumber from "@/components/AnimatedNumber";
import TerminalPrompt from "@/components/TerminalPrompt";

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

export default function AchievementsPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<"all" | "hackathons" | "courses">("all");
  const profile = useGitHubStore((s) => s.profile);
  const fetchProfile = useGitHubStore((s) => s.fetchProfile);

  useEffect(() => {
    router.replace("/home/skills");
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const filteredCerts = CERTIFICATES.filter((cert) => {
    if (activeCategory === "hackathons") return cert.category === "Hackathon";
    if (activeCategory === "courses")
      return cert.category === "Course Completion" || cert.category === "Professional Certification";
    return true;
  });

  return (
    <div className="relative flex flex-col grow">
      {/* Linux prompt */}
      <TerminalPrompt
        command="achievements"
        args="--certificates"
        statusBadge={
          <span className="text-muted text-[10px] hidden sm:inline font-mono">
            Status: <span className="text-command uppercase font-semibold">[VERIFIED]</span> · Public Credentials
          </span>
        }
      />

      <header className="mt-2 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <TextReveal
              text="Achievements & Credentials"
              className="text-2xl sm:text-3xl font-sans font-semibold tracking-tight text-foreground"
            />
            <p className="mt-1 text-sm sm:text-base font-sans text-muted leading-relaxed max-w-[65ch]">
              Verified hackathon awards, official course completion accreditations, and engineering credentials for Souvik Karmakar.
            </p>
          </div>

          {/* Action Header: Resume Button + Filter Tabs */}
          <div data-reveal className="flex flex-wrap items-center gap-2">
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
      </header>

      {/* Overview Stat Badges with GSAP Number Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <div className="rounded-xl border border-border bg-surface/60 backdrop-blur-sm p-3 font-mono">
          <span className="text-[10px] uppercase text-muted tracking-wider block">Contributions</span>
          <span className="text-lg sm:text-xl font-bold text-command">
            <AnimatedNumber value={profile?.totalContributions || 761} suffix="+" />
          </span>
          <span className="text-[10px] text-muted/70 block mt-0.5">Verified activity</span>
        </div>
        <div className="rounded-xl border border-border bg-surface/60 backdrop-blur-sm p-3 font-mono">
          <span className="text-[10px] uppercase text-muted tracking-wider block">Verified Credentials</span>
          <span className="text-lg sm:text-xl font-bold text-foreground">
            <AnimatedNumber value={CERTIFICATES.length} />
          </span>
          <span className="text-[10px] text-muted/70 block mt-0.5">Hackathons &amp; courses</span>
        </div>
        <div className="rounded-xl border border-border bg-surface/60 backdrop-blur-sm p-3 font-mono">
          <span className="text-[10px] uppercase text-muted tracking-wider block">Core Systems</span>
          <span className="text-lg sm:text-xl font-bold text-success">
            <AnimatedNumber value={5} suffix="+" />
          </span>
          <span className="text-[10px] text-muted/70 block mt-0.5">Engineered repos</span>
        </div>
        <div className="rounded-xl border border-border bg-surface/60 backdrop-blur-sm p-3 font-mono">
          <span className="text-[10px] uppercase text-muted tracking-wider block">Type Safety</span>
          <span className="text-lg sm:text-xl font-bold text-foreground">
            <AnimatedNumber value={100} suffix="%" />
          </span>
          <span className="text-[10px] text-muted/70 block mt-0.5">Strict TypeScript</span>
        </div>
      </div>

      {/* Verified Hackathon & Course Certificates Grid */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border font-mono text-xs">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-foreground">
            Verified Hackathons &amp; Course Completion Credentials
          </h2>
          <span className="text-muted/60 text-[10px] ml-auto">
            {filteredCerts.length} records displayed
          </span>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          {filteredCerts.map((cert) => (
            <a
              key={cert.id}
              href={cert.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-border bg-surface/80 backdrop-blur-md p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col justify-between transition-[background-color,border-color] duration-150 hover:border-command/40 hover:bg-surface min-w-0 cursor-pointer text-left block"
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

      <footer className="mt-8 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs font-sans text-muted">
        <span>Looking to review complete engineering background or projects?</span>
        <div className="flex items-center gap-3">
          <a
            href={RESUME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-command font-mono hover:underline inline-flex items-center gap-1"
          >
            Download Resume (PDF) ↗
          </a>
          <span className="text-muted/40">·</span>
          <TransitionLink
            href="/home/projects"
            className="text-command font-mono hover:underline inline-flex items-center gap-1"
          >
            View all projects →
          </TransitionLink>
        </div>
      </footer>
    </div>
  );
}
