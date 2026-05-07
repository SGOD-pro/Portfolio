import type { Metadata } from "next";
import { Space_Mono, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  variable: "--font-sans-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "A portfolio site",
  description: "A simple portfolio site built with Next.js by @souvikkarmkar",
  keywords: ["portfolio", "next.js", "react", "souvikkarmkar","ai", "artificial intelligence", "machine learning", "deep learning", "data science", "python", "javascript", "typescript", "web development", "software engineering","ai enthousiast",],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceMono.variable} ${plexMono.variable} h-full antialiased dark`}
    >
      <body className="flex flex-col min-h-dvh w-full">
          {children}
      </body>
    </html>
  );
}
