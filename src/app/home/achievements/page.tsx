"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import TextReveal from "@/components/TextReveal";
import AnimatedNumber from "@/components/AnimatedNumber";
import PdfCertificateViewer, { CertificateData } from "@/components/PdfCertificateViewer";

interface Milestone {
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

export type Certificate = CertificateData;

const CERTIFICATES: Certificate[] = [
  {
    id: "hta-gdg",
    title: "Hack the App (HTA) — GDG Hackathon",
    issuer: "Google Developer Groups (GDG)",
    category: "Hackathon",
    recipient: "Souvik Karmakar",
    date: "Aug 2024",
    fileName: "hta-gdg-certificate-souvik_karmakar (1).pdf",
    fileSize: "16 KB",
    description:
      "Awarded by Google Developer Groups (GDG) for engineering competition excellence and rapid prototype development in Hack the App.",
    skills: ["Fullstack Architecture", "API Integration", "Fast Prototyping", "GDG Hackathon"],
  },
  {
    id: "team-bro-code",
    title: "Team Bro Code — National Hackathon Finalist",
    issuer: "National Hackathon Summit",
    category: "Hackathon",
    recipient: "Souvik Karmakar",
    date: "Aug 2024",
    fileName: "09-TEAM-BRO-CODE.pdf",
    fileSize: "3.1 MB",
    description:
      "Engineered collaborative multi-tenant fullstack architecture under 24-hour hackathon constraints with real-time sync.",
    skills: ["Real-time Systems", "System Architecture", "Hackathon Finalist"],
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
    description:
      "Professional accreditation verifying engineering proficiency in frontend performance, type-safe APIs, and responsive design systems.",
    skills: ["Frontend Engineering", "Type Safety", "Performance Optimization"],
  },
];

const MILESTONES: Milestone[] = [
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

  const [activeTab, setActiveTab] = useState<"all" | "certificates" | "milestones">("all");
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const filteredCerts =
    activeTab === "all" || activeTab === "certificates" ? CERTIFICATES : [];
  const filteredMilestones =
    activeTab === "all" || activeTab === "milestones" ? MILESTONES : [];

  return (
    <div ref={containerRef} className="relative flex flex-col grow">
      {/* Linux prompt */}
      <div className="my-1.5 flex items-center gap-2 text-xs font-mono" data-reveal>
        <span className="text-field-placeholder font-bold">souvik@portfolio:~$</span>
        <span className="text-command">achievements --all</span>
        <span className="text-muted text-[10px] ml-auto hidden sm:inline font-mono">
          Status: <span className="text-accent uppercase font-semibold">[VERIFIED]</span> · Public Credentials
        </span>
      </div>

      <header className="mt-2 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <TextReveal
              text="Achievements & Credentials"
              className="text-2xl sm:text-3xl font-sans font-semibold tracking-tight text-foreground"
            />
            <p data-reveal className="mt-1 text-sm sm:text-base font-sans text-muted leading-relaxed max-w-[65ch]">
              Verified hackathon awards, course completion certifications, and engineering deliveries for Souvik Karmakar.
            </p>
          </div>

          {/* Filter Pills */}
          <div data-reveal className="flex items-center gap-1.5 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 rounded-lg border transition cursor-pointer ${
                activeTab === "all"
                  ? "border-accent bg-accent/20 text-accent font-semibold"
                  : "border-white/10 text-muted hover:text-foreground"
              }`}
            >
              All ({CERTIFICATES.length + MILESTONES.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("certificates")}
              className={`px-3 py-1 rounded-lg border transition cursor-pointer ${
                activeTab === "certificates"
                  ? "border-accent bg-accent/20 text-accent font-semibold"
                  : "border-white/10 text-muted hover:text-foreground"
              }`}
            >
              Certificates ({CERTIFICATES.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("milestones")}
              className={`px-3 py-1 rounded-lg border transition cursor-pointer ${
                activeTab === "milestones"
                  ? "border-accent bg-accent/20 text-accent font-semibold"
                  : "border-white/10 text-muted hover:text-foreground"
              }`}
            >
              Milestones ({MILESTONES.length})
            </button>
          </div>
        </div>
      </header>

      {/* Overview Stat Badges with GSAP Number Counters */}
      <div data-reveal className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm p-3 font-mono">
          <span className="text-[10px] uppercase text-muted tracking-wider block">Contributions</span>
          <span className="text-lg sm:text-xl font-bold text-accent">
            <AnimatedNumber value={833} suffix="+" />
          </span>
          <span className="text-[10px] text-muted/70 block mt-0.5">Verified activity</span>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm p-3 font-mono">
          <span className="text-[10px] uppercase text-muted tracking-wider block">Certificates</span>
          <span className="text-lg sm:text-xl font-bold text-foreground">
            <AnimatedNumber value={CERTIFICATES.length} />
          </span>
          <span className="text-[10px] text-muted/70 block mt-0.5">Hackathons &amp; courses</span>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm p-3 font-mono">
          <span className="text-[10px] uppercase text-muted tracking-wider block">Core Systems</span>
          <span className="text-lg sm:text-xl font-bold text-success">
            <AnimatedNumber value={5} suffix="+" />
          </span>
          <span className="text-[10px] text-muted/70 block mt-0.5">Engineered repos</span>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm p-3 font-mono">
          <span className="text-[10px] uppercase text-muted tracking-wider block">Type Safety</span>
          <span className="text-lg sm:text-xl font-bold text-foreground">
            <AnimatedNumber value={100} suffix="%" />
          </span>
          <span className="text-[10px] text-muted/70 block mt-0.5">Strict TypeScript</span>
        </div>
      </div>

      {/* Section 1: Hackathon & Course Certificates */}
      {filteredCerts.length > 0 && (
        <section className="mb-8" data-reveal>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10 font-mono text-xs">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <h2 className="text-xs uppercase tracking-wider font-semibold text-foreground">
              Hackathons &amp; Course Completion Certificates
            </h2>
            <span className="text-muted/60 text-[10px] ml-auto">
              {filteredCerts.length} verified records
            </span>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            {filteredCerts.map((cert) => (
              <article
                key={cert.id}
                className="rounded-xl border border-white/10 bg-black/50 backdrop-blur-md p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col justify-between transition-colors duration-150 hover:border-white/25 hover:bg-black/60 min-w-0"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10 font-mono text-[10px]">
                    <span className="rounded px-2 py-0.5 bg-accent/15 border border-accent/40 text-accent font-semibold uppercase">
                      {cert.category}
                    </span>
                    <span className="text-muted/70">{cert.date}</span>
                  </div>

                  <h3 className="mt-2.5 text-base font-sans font-semibold text-foreground tracking-tight">
                    {cert.title}
                  </h3>

                  <p className="mt-1 text-xs text-accent font-mono">
                    Issuer: {cert.issuer}
                  </p>

                  <p className="mt-2 text-xs font-sans text-muted leading-relaxed">
                    {cert.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted/80">
                    <span className="text-success">●</span>
                    <span className="truncate max-w-[180px]" title={cert.fileName}>
                      {cert.fileName}
                    </span>
                    <span className="text-white/20">({cert.fileSize})</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCert(cert)}
                    className="rounded border border-accent/60 bg-accent/10 px-2.5 py-1 text-[11px] font-mono text-accent hover:bg-accent/25 transition cursor-pointer"
                  >
                    Inspect Credential ↗
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Section 2: Technical Milestones */}
      {filteredMilestones.length > 0 && (
        <section data-reveal>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10 font-mono text-xs">
            <span className="h-2 w-2 rounded-full bg-success" />
            <h2 className="text-xs uppercase tracking-wider font-semibold text-foreground">
              Engineering Deliveries &amp; Milestones
            </h2>
            <span className="text-muted/60 text-[10px] ml-auto">
              {filteredMilestones.length} systems
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {filteredMilestones.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-4 sm:p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-colors duration-150 hover:border-white/20 hover:bg-black/50 flex flex-col justify-between min-w-0"
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

                  <h3 className="mt-3 text-base sm:text-lg font-sans font-semibold text-foreground tracking-tight">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm font-sans text-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <ul className="flex flex-wrap gap-1.5">
                    {item.metrics.map((metric) => (
                      <li
                        key={metric}
                        className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-muted"
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
        </section>
      )}

      {/* Interactive PDF Certificate Viewer with Zoom, Pan & Drag Controllers */}
      {selectedCert && (
        <PdfCertificateViewer
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}

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
