"use client";

import React, { useEffect } from "react";
import DotGrid from "@/components/DotBackground";
import { useViewTransition } from "@/hooks/useViewTransition";
import TransitionLink from "@/components/TransitionLink";

export default function RootPage() {
  const { navigate } = useViewTransition();

  // "Open workspace" and unfocused Enter navigate immediately to /home
  // Do not intercept Enter on focused links, buttons or form controls.
  // Preserve modifier keys, composition events and normal keyboard access.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      if (event.key !== "Enter") return;
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;

      const activeEl = document.activeElement;
      if (
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement ||
        activeEl instanceof HTMLButtonElement ||
        activeEl instanceof HTMLAnchorElement ||
        (activeEl as HTMLElement | null)?.isContentEditable
      ) {
        return;
      }

      event.preventDefault();
      navigate("/home");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);

  return (
    <main className="relative min-h-dvh w-full bg-background text-foreground flex items-center justify-center p-5 selection:bg-accent/30 selection:text-white">
      {/* Background Interactive Dot Grid Canvas */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <DotGrid
          dotSize={2.8}
          gap={20}
          baseColor="#173629"
          activeColor="#9CAF88"
          proximity={160}
          shockRadius={280}
          shockStrength={5}
          returnDuration={1.3}
          opacity={0.75}
        />
      </div>

      {/* One Centered Terminal Panel: max-w-[460px], 28px internal padding (p-7) */}
      <section
        aria-label="Workspace Entry"
        className="relative z-10 w-full max-w-[460px] rounded-2xl border border-border bg-surface/85 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.06)] p-7 flex flex-col slide-page"
      >
        {/* Header: SGOD.PRO / WORKSPACE */}
        <header className="flex items-center justify-between pb-4 border-b border-border text-[11px] font-mono text-muted tracking-wider uppercase">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-danger shrink-0" />
            <span className="h-2 w-2 rounded-full bg-warning shrink-0" />
            <span className="h-2 w-2 rounded-full bg-success shrink-0" />
          </div>
          <span>SGOD.PRO / WORKSPACE</span>
        </header>

        {/* Small monospace command: visitor@sgod:~$ inspect portfolio */}
        <div className="mt-5 root-command-reveal flex items-center gap-1 text-xs font-mono text-command select-none">
          <span className="font-medium">visitor@sgod:~$</span>
          <span className="font-medium">inspect portfolio</span>
          <span
            className="root-cursor-blink inline-block w-1.5 h-3.5 bg-command ml-0.5"
            aria-hidden="true"
          />
        </div>

        {/* Main heading: There's more behind \n the prompt. */}
        <h1 className="mt-4 root-heading-entrance text-[26px] sm:text-[28px] font-sans font-medium text-foreground leading-[1.2] tracking-tight">
          There’s more behind
          <br />
          the prompt.
        </h1>

        {/* Supporting sentence: Follow the code. See how it connects. */}
        <p className="mt-2 text-sm font-sans text-muted leading-[1.6]">
          Follow the code. See how it connects.
        </p>

        {/* Primary Action + Keyboard Hint */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent text-accent-foreground px-4 py-2.5 text-sm font-sans font-medium hover:bg-accent-hover transition shadow-[0_2px_12px_rgba(232,65,44,0.3)] focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 cursor-pointer"
          >
            <span>Open workspace</span>
            <span>→</span>
          </button>

          <span className="text-[11px] font-mono text-muted/80">
            or press{" "}
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface-secondary/50 text-foreground text-[10px] font-mono shadow-sm">
              Enter
            </kbd>
          </span>
        </div>

        {/* Small footer links: Projects ↗   Contact */}
        <footer className="mt-7 pt-4 border-t border-border flex items-center justify-between text-xs font-mono text-muted">
          <TransitionLink
            href="/home/projects"
            className="hover:text-foreground transition focus-visible:outline-2 focus-visible:outline-focus rounded"
          >
            Projects ↗
          </TransitionLink>
          <TransitionLink
            href="/home/contact"
            className="hover:text-foreground transition focus-visible:outline-2 focus-visible:outline-focus rounded"
          >
            Contact
          </TransitionLink>
        </footer>
      </section>
    </main>
  );
}
