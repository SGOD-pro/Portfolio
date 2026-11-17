"use client";

import DotGrid from "@/components/DotBackground";
import GlassSurface from "@/components/GlassSurface";
import CommandBox from "@/components/CommandBox";
import React, {
  useCallback,
  useRef,
  useState,
} from "react";
import "./animation.css";

function HomeLayout({
  children,
  rightSide,
}: {
  children: React.ReactNode;
  rightSide: React.ReactNode;
}) {
  const sceneRef = useRef<HTMLCanvasElement | null>(null);

  const mainGlassRef = useRef<HTMLDivElement | null>(null);
  const sidebarGlassRef = useRef<HTMLDivElement | null>(null);

  const [sceneCanvas, setSceneCanvas] =
    useState<HTMLCanvasElement | null>(null);

  const snapshotRef = useRef<{
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    background: string;
  } | null>(null);

  const handleDotFrame = useCallback((source: HTMLCanvasElement) => {
    if (!source.width || !source.height) return;

    // Actual visible canvas, used to align the texture.
    sceneRef.current = source;

    let snapshot = snapshotRef.current;

    if (!snapshot) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { alpha: false });

      if (!context) return;

      const root = source.closest<HTMLElement>("[data-glass-scene]");

      snapshot = {
        canvas,
        context,
        background: root
          ? getComputedStyle(root).backgroundColor
          : "#0a0a0a",
      };

      snapshotRef.current = snapshot;
      setSceneCanvas(canvas);
    }

    const { canvas, context, background } = snapshot;

    if (canvas.width !== source.width) {
      canvas.width = source.width;
    }

    if (canvas.height !== source.height) {
      canvas.height = source.height;
    }

    // Include the solid background so the original dots do not show
    // through as a second, unrefracted layer.
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Copy immediately after DotGrid draws, before WebGL may clear
    // its drawing buffer.
    context.drawImage(source, 0, 0);

    // The GlassSurface file I supplied handles this refresh event.
    // Refresh only when DotGrid actually produces a frame.
    mainGlassRef.current?.dispatchEvent(new Event("glass-refresh"));
    sidebarGlassRef.current?.dispatchEvent(new Event("glass-refresh"));
  }, []);

  return (
    <div
      data-glass-scene
      className="min-h-dvh lg:h-dvh w-full bg-background text-foreground relative flex flex-col overflow-x-hidden lg:overflow-hidden"
    >
      {/* Background Interactive Dot Grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <DotGrid
          onFrame={handleDotFrame}
          dotSize={4}
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
      <main className="flex-1 w-full p-2 sm:p-3 md:p-4 flex flex-col lg:flex-row gap-3 md:gap-4 relative z-10 lg:h-full lg:max-h-full lg:overflow-hidden pb-36 sm:pb-40 lg:pb-4">
        {/* Left Panel: Consistent Shell (Header + Content + CommandBox Footer) */}
        <section className="flex-1 flex flex-col min-w-0 min-h-[500px] lg:h-full lg:overflow-hidden relative z-40 lg:z-auto">
          <GlassSurface
            ref={mainGlassRef}
            backdrop={sceneCanvas ?? undefined}
            backdropRef={sceneRef}
            backdropFit="stretch"
            live={false}
            borderRadius={24}
            refraction={0.55}
            thickness={10}
            bevel={0.3}
            distortion={0.02}
            dispersion={0.02}
            reflection={0.42}
            frost={0.01}
            shine={0.35}
            borderWidth={1}
            borderOpacity={0.12}
            tint="#ffffff"
            tintOpacity={0.01}
            className="w-full h-full flex flex-col p-4 sm:p-5 lg:p-6 lg:overflow-hidden"
          >
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

            {/* 2. Scrollable Page Content Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 py-3.5 pr-2 pb-28 sm:pb-32 lg:pb-2 focus:outline-none terminal-scrollbar">
              <div className="min-h-full flex flex-col">{children}</div>
            </div>

            {/* 3. Consistent Shell Footer (Search / Nav CommandBox) - Fixed with Glass + Frost on Mobile */}
            <footer className="fixed bottom-0 left-0 right-0 z-[100] bg-[#0a0a0a]/90 backdrop-blur-2xl border-t border-white/20 px-3 py-2.5 sm:px-4 sm:py-3 shadow-[0_-10px_35px_rgba(0,0,0,0.85)] lg:static lg:z-auto lg:bg-transparent lg:backdrop-blur-none lg:border-t lg:border-white/10 lg:pt-3 lg:pb-2 lg:px-0 lg:shadow-none shrink-0">
              <CommandBox />
            </footer>
          </GlassSurface>
        </section>

        {/* Right Panel: Sidebar (3D Logo + Connect Links) */}
        <aside className="w-full lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col h-auto lg:h-full lg:overflow-hidden mb-10 lg:mb-0 relative z-10 lg:z-auto">
          <GlassSurface
            ref={sidebarGlassRef}
            backdrop={sceneCanvas ?? undefined}
            backdropRef={sceneRef}
            backdropFit="stretch"
            live={false}
            borderRadius={24}
            refraction={0.55}
            thickness={10}
            bevel={0.3}
            distortion={0.02}
            dispersion={0.02}
            reflection={0.42}
            frost={0.01}
            shine={0.35}
            borderWidth={1}
            borderOpacity={0.12}
            tint="#ffffff"
            tintOpacity={0.01}
            className="w-full h-full p-4 sm:p-5 flex flex-col overflow-y-auto terminal-scrollbar"
          >
            {rightSide}
          </GlassSurface>
        </aside>
      </main>
    </div>
  );
}

export default HomeLayout;
