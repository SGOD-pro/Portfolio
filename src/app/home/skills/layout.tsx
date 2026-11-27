import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skills & Achievements",
  description:
    "Technical capabilities, engineering stack, and verified achievements of Souvik Karmakar across frontend, backend, AI/ML, and DevOps.",
};

export default function SkillsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
