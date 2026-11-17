"use client";

import DotGrid from "@/components/DotBackground";
import GlassSurface from "@/components/GlassSurface";
import CommandBox from "@/components/CommandBox";
import React, { ViewTransition } from "react";
import "./animation.css";

function HomeLayout({
  children,
  rightSide,
}: {
  children: React.ReactNode;
  rightSide: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh lg:h-dvh w-full bg-background text-foreground relative flex flex-col overflow-x-hidden lg:overflow-hidden">
      {/* Background Interactive Dot Grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <DotGrid
          dotSize={3}
          gap={20}
          baseColor="#383838"
          activeColor="#b46004"
          proximity={140}
          shockRadius={250}
          shockStrength={5}
          returnDuration={1.2}
          opacity={0.85}
        />
      </div>

      {/* Main Full-Page Shell */}
      <main className="flex-1 w-full p-2.5 sm:p-3 md:p-4 flex flex-col lg:flex-row gap-3 md:gap-4 relative z-10 lg:h-full lg:max-h-full lg:overflow-hidden">
        {/* Left Panel: Consistent Shell (Header + Content + CommandBox Footer) */}
        <section className="flex-1 flex flex-col min-w-0 min-h-[500px] lg:h-full lg:overflow-hidden">
          <GlassSurface className="w-full h-full flex flex-col p-4 sm:p-5 lg:p-6 overflow-hidden">
            {/* 1. Consistent Shell Header (Mac dots + title on all pages) */}
            <header className="flex items-center justify-between border-b border-white/10 pb-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-danger shrink-0" />
                <span className="h-2 w-2 rounded-full bg-warning shrink-0" />
                <span className="h-2 w-2 rounded-full bg-success shrink-0" />
                <span className="ml-2 font-medium tracking-widest uppercase text-[10px] text-muted/80 font-mono">
                  portfolio shell
                </span>
              </div>
              <div className="text-[9px] text-muted/70 uppercase tracking-widest font-mono hidden sm:flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.02]">
                  ssh · 127.0.0.1
                </span>
              </div>
            </header>

            {/* 2. Scrollable Page Content Area with Transition */}
            <div className="flex-1 overflow-y-auto min-h-0 py-3.5 pr-2 focus:outline-none">
              <ViewTransition name="page-content" default="slide-page">
                <div className="min-h-full flex flex-col">{children}</div>
              </ViewTransition>
            </div>

            {/* 3. Consistent Shell Footer (Search / Nav CommandBox) */}
            <footer className="border-t border-white/10 pt-3 pb-2 shrink-0">
              <CommandBox />
            </footer>
          </GlassSurface>
        </section>

        {/* Right Panel: Sidebar (3D Logo + Connect Links) */}
        <aside className="w-full lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col h-auto lg:h-full lg:overflow-hidden">
          <GlassSurface className="w-full h-full p-4 sm:p-5 flex flex-col overflow-y-auto">
            {rightSide}
          </GlassSurface>
        </aside>
      </main>
    </div>
  );
}

export default HomeLayout;
