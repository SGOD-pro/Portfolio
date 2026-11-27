import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Achievements & Certifications",
  description:
    "Hackathon awards, course completions, and professional certifications earned by Souvik Karmakar.",
};

export default function AchievementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
