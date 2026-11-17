"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, startTransition } from "react";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        startTransition(() => {
          router.push("/home");
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  return (
    <main className="bg-background flex items-center justify-center min-h-dvh flex-col p-4">
      <div className="w-full max-w-md rounded-xl overflow-hidden border border-segment/60 bg-surface shadow-2xl">
        <header className="h-10 bg-default flex items-center justify-start gap-1.5 border-b border-segment px-3">
          <span className="rounded-full bg-danger w-3 h-3 inline-block" />
          <span className="rounded-full bg-warning w-3 h-3 inline-block" />
          <span className="rounded-full bg-success w-3 h-3 inline-block" />
          <span className="ml-2 text-[11px] uppercase tracking-widest text-muted">terminal</span>
        </header>
        <div className="p-5 font-mono text-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-field-placeholder">user@portfolio:$</span>
            <span className="text-command font-semibold">whoami</span>
          </div>
          <div className="text-foreground pl-2 border-l border-segment/60 py-1 text-xs sm:text-sm">
            <p className="font-bold text-foreground">Souvik Karmakar</p>
            <p className="text-muted">Fullstack Developer &amp; Applied AI Engineer</p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/home"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-accent text-accent-foreground px-5 py-2.5 text-xs uppercase font-bold tracking-wider hover:bg-accent-hover active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 min-h-[44px]"
            >
              <span>Enter Portfolio</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
            <span className="text-xs text-muted hidden sm:inline">
              or press <kbd className="px-1.5 py-0.5 rounded border border-segment bg-overlay text-[11px]">Enter &crarr;</kbd>
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
