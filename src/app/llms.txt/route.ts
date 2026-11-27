import { NextResponse } from "next/server";
import { getProjectsList } from "@/lib/github/api";
import { CERTIFICATES, RESUME_URL } from "@/lib/certificates";

export const revalidate = 3600;

export async function GET() {
  let projectsSection = "- Projects are fetched from https://github.com/SGOD-pro";
  try {
    const result = await getProjectsList();
    if (result.projects.length > 0) {
      projectsSection = result.projects
        .map((repo) => {
          const desc = repo.description ? ` — ${repo.description}` : "";
          const lang = repo.language ? ` [${repo.language}]` : "";
          return `- [${repo.name}](${repo.htmlUrl})${lang}${desc} (inspect: /home/projects?project=${encodeURIComponent(repo.name)}&doc=readme)`;
        })
        .join("\n");
    }
  } catch {
    // Keep honest fallback if GitHub API is temporarily unavailable
  }

  const certsSection = CERTIFICATES.map(
    (c) => `- **${c.title}** (${c.issuer}, ${c.date}) — ${c.description}`
  ).join("\n");

  const body = `# Souvik Karmakar (@SGOD-pro)

> Fullstack Developer & Applied AI Engineer specializing in TypeScript, Next.js, React, Python, AI agent systems, and resilient backend architectures.

## Navigation
- [Workspace Entry](/)
- [About / Overview](/home)
- [Skills & Achievements](/home/skills)
- [Projects & Architecture Docs](/home/projects)
- [Experience Timeline](/home/experience)
- [Contact](/home/contact)

## Core Focus
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, GSAP, HTML5 / WebGL
- **Backend & Systems:** Node.js, Python, PostgreSQL, Redis, MongoDB
- **AI & Machine Learning:** OpenAI API, PyTorch, LangChain, Vector Databases, RAG Pipelines, Scikit-learn
- **DevOps & Tooling:** Docker, Kubernetes, AWS, GitHub Actions, Linux / Shell, CI/CD Workflows

## Experience Timeline
- **2026 — AI Agent Systems, System Design & Fullstack Web Engineering:** Designing and building AI agent systems and agentic workflows alongside end-to-end fullstack web engineering, scalable system design, and automated CI/CD pipelines.
- **2025 — AI & Machine Learning:** Learned core artificial intelligence and machine learning concepts, model integration, and applied intelligent workflows.
- **2024 — Backend Integration, Docker & Fullstack Development:** Integrated backend APIs and services into web applications, learned Docker containerization, and transitioned into fullstack development.
- **2023 — Web Development Foundations:** Started web development building responsive interfaces and client-side behavior using HTML, CSS, and JavaScript.

## Public Projects (GitHub @SGOD-pro)
${projectsSection}

## Certifications & Hackathons
${certsSection}

## Links
- GitHub: https://github.com/SGOD-pro
- Resume: ${RESUME_URL}
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
