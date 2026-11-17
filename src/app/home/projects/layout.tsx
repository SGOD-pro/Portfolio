import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects & Work",
  description:
    "Selected software repositories, verified documentation, and architectural designs by Souvik Karmakar.",
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
