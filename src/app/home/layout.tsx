"use client";

import DotGrid from "@/components/DotBackground";
import GlassSurface from "@/components/GlassSurface";
import CommandBox from "@/components/CommandBox";
import React, { ViewTransition } from "react";
import "./animation.css";
import { Glass } from "glisse";
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
      <main className="flex-1 w-full p-2 sm:p-3 md:p-4 flex flex-col lg:flex-row gap-3 md:gap-4 relative z-10 lg:h-full lg:max-h-full lg:overflow-hidden">
        {/* Left Panel: Consistent Shell (Header + Content + CommandBox Footer) */}
        <section className="flex-1 flex flex-col min-w-0 min-h-[500px] lg:h-full lg:overflow-hidden">
          {/* <GlassSurface className="w-full h-full flex flex-col p-4 sm:p-5 overflow-hidden"> */}
          <Glass
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 75,
              background: "none",
              "--lg-glass-bend": 0.75,
              "--lg-glass-dispersion": 2,
              "--lg-blur": "1px",
              "--lg-rim-shine": 12,
            }}
            className=" flex flex-col p-4 sm:p-5 "
          >
            {/* 1. Consistent Shell Header (Mac dots + title on all pages) */}
            <header className="flex items-center justify-between border-b border-segment/40 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-danger shrink-0" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning shrink-0" />
                <span className="h-2.5 w-2.5 rounded-full bg-success shrink-0" />
                <span className="ml-2.5 font-medium tracking-[0.2em] uppercase text-xs text-muted">
                  portfolio shell
                </span>
              </div>
              <div className="text-[11px] text-muted uppercase tracking-wider font-mono hidden sm:flex items-center gap-2">
                <span className="px-2 py-0.5 rounded border border-segment/40 bg-overlay/40">
                  ssh · 127.0.0.1
                </span>
              </div>
            </header>

            {/* 2. Scrollable Page Content Area with Transition */}
            <div className="flex-1 overflow-y-auto min-h-0 py-3 pr-1 focus:outline-none">
              <ViewTransition name="page-content" default="slide-page">
                <div className="min-h-full flex flex-col">{children}</div>
              </ViewTransition>
            </div>

            {/* 3. Consistent Shell Footer (Search / Nav CommandBox) */}
            <footer className="border-t border-segment/40 pt-2 shrink-0">
              <CommandBox />
            </footer>
          </Glass>
          {/* </GlassSurface> */}
        </section>

        {/* Right Panel: Sidebar (3D Logo + Connect Links) */}
        <aside className="w-full lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col h-auto lg:h-full lg:overflow-hidden">
          <GlassSurface className="w-full h-full p-3 sm:p-4 flex flex-col overflow-y-auto">
            {rightSide}
          </GlassSurface>
        </aside>
      </main>
    </div>
  );
}

export default HomeLayout;
