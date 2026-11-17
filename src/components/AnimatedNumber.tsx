"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

/**
 * Performant numeric counter using GSAP.
 * - Direct DOM manipulation on textContent: zero React state updates per frame.
 * - Tabular numbers to avoid layout shifts.
 * - Screen readers receive the accurate final value via aria-label.
 * - Immediately displays final value under prefers-reduced-motion: reduce.
 */
export default function AnimatedNumber({
  value,
  format,
  className = "",
  duration = 0.45,
  prefix = "",
  suffix = "",
}: AnimatedNumberProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const currentValRef = useRef(0);

  useGSAP(
    () => {
      if (!spanRef.current) return;
      if (typeof window === "undefined") return;

      const formatVal = (v: number) => {
        const rounded = Math.round(v);
        return format ? format(rounded) : rounded.toLocaleString();
      };

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        spanRef.current.textContent = `${prefix}${formatVal(value)}${suffix}`;
        currentValRef.current = value;
        return;
      }

      const tweenObj = { val: currentValRef.current };

      gsap.to(tweenObj, {
        val: value,
        duration,
        ease: "power2.out",
        onUpdate: () => {
          if (spanRef.current) {
            spanRef.current.textContent = `${prefix}${formatVal(tweenObj.val)}${suffix}`;
          }
        },
        onComplete: () => {
          currentValRef.current = value;
          if (spanRef.current) {
            spanRef.current.textContent = `${prefix}${formatVal(value)}${suffix}`;
          }
        },
      });
    },
    {
      dependencies: [value, prefix, suffix],
    }
  );

  return (
    <span
      ref={spanRef}
      className={`tabular-nums font-mono ${className}`}
      aria-label={`${prefix}${value}${suffix}`}
    >
      {prefix}
      {format ? format(value) : value}
      {suffix}
    </span>
  );
}
