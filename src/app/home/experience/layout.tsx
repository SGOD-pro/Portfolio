import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Experience & Timeline",
  description:
    "Engineering timeline of Souvik Karmakar from web foundations (2023) to fullstack systems, AI/ML, and agentic architectures (2026).",
};

export default function ExperienceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
