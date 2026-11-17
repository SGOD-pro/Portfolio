import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Channels",
  description:
    "Direct engineering contact channels for Souvik Karmakar for fullstack and applied AI opportunities.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
