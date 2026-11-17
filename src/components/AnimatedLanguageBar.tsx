"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

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
  const fillRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!fillRef.current) return;
      if (typeof window === "undefined") return;

      const targetScale = Math.min(1, Math.max(0.01, percentage / 100));

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(fillRef.current, { scaleX: targetScale });
        return;
      }

      gsap.fromTo(
        fillRef.current,
        { scaleX: 0 },
        {
          scaleX: targetScale,
          duration: 0.45,
          ease: "power2.out",
        }
      );
    },
    {
      scope: fillRef,
      dependencies: [percentage],
    }
  );

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
        ref={fillRef}
        className={`h-full rounded-full origin-left ${color}`}
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
