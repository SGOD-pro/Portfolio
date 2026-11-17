"use client";

import React from "react";

interface TerminalPromptProps {
  command: string;
  args?: string;
  statusBadge?: React.ReactNode;
  className?: string;
}

/**
 * Authentic Linux Terminal Prompt:
 * - souvik@portfolio in vibrant terminal green (#4ADE80, matching swyra@ASUS)
 * - : in muted separator
 * - ~ in terminal directory blue (#38BDF8)
 * - $ in muted prompt symbol
 * - command in theme accent color (Tomato Red #D63825 / text-accent)
 * - optional args in text-command (#9CAF88)
 */
export default function TerminalPrompt({
  command,
  args,
  statusBadge,
  className = "",
}: TerminalPromptProps) {
  return (
    <div
      data-reveal
      className={`my-1.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono select-none ${className}`}
    >
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="font-semibold text-[#4ADE80]">souvik@portfolio</span>
        <span className="text-muted/60">:</span>
        <span className="font-semibold text-[#38BDF8]">~</span>
        <span className="text-muted/60">$</span>
        <span className="text-accent font-semibold ml-1">{command}</span>
        {args && <span className="text-command ml-1">{args}</span>}
      </div>

      {statusBadge && <div>{statusBadge}</div>}
    </div>
  );
}
