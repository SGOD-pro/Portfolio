"use client";

import React from "react";

interface AnimatedLanguageBarProps {
  percentage: number; // 0 to 100
  color: string;
  className?: string;
}

export default function AnimatedLanguageBar({
  percentage,
  color,
  className = "",
}: AnimatedLanguageBarProps) {
  const targetScale = Math.min(1, Math.max(0.01, percentage / 100));

  return (
    <div
      className={`h-1.5 w-full rounded-full bg-white/10 overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(percentage)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Language share: ${percentage.toFixed(1)}%`}
    >
      <div
        className={`h-full rounded-full origin-left lang-bar-fill ${color}`}
        style={{ "--bar-scale": targetScale } as React.CSSProperties}
      />
    </div>
  );
}
