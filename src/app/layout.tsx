import type { Metadata } from "next";
import { Geist, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Souvik Karmakar | Fullstack Developer & Applied AI Engineer",
    template: "%s | Souvik Karmakar",
  },
  description:
    "Portfolio of Souvik Karmakar (@SGOD-pro) - Fullstack Developer & Applied AI Engineer specializing in TypeScript, Next.js, and Python.",
  keywords: [
    "Souvik Karmakar",
    "SGOD-pro",
    "Fullstack Developer",
    "Applied AI Engineer",
    "TypeScript",
    "Next.js",
    "React",
    "Python",
    "Software Engineer",
  ],
  authors: [{ name: "Souvik Karmakar", url: "https://github.com/SGOD-pro" }],
  creator: "Souvik Karmakar",
  openGraph: {
    title: "Souvik Karmakar | Fullstack Developer & Applied AI Engineer",
    description:
      "Selected software repositories, verified documentation, and architectural designs by Souvik Karmakar.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Souvik Karmakar | Fullstack Developer & Applied AI Engineer",
    description:
      "Selected software repositories, verified documentation, and architectural designs by Souvik Karmakar.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${plexMono.variable} h-full antialiased dark`}
    >
      <body className="flex flex-col min-h-dvh w-full font-sans">{children}</body>
    </html>
  );
}
