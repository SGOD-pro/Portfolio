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
  delay?: number;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const DOUBLE_DIGITS = [...DIGITS, ...DIGITS]; // 20 items: index 0..9, then 10..19. Each slot is exactly 5% of height

/**
 * Mechanical Rolling Counter (Odometer Slot Machine style) using GSAP.
 * - Each digit column rolls up smoothly from bottom to top (0 -> 1 -> 2 ... -> target).
 * - Monospace 1ch slot width guarantees zero jitter or clipping.
 * - Non-digit characters (+, %, commas, dots) remain static and aligned.
 * - Fully accessible with aria-label containing the complete numeric string.
 * - Respects prefers-reduced-motion: settles immediately without animation.
 */
export default function AnimatedNumber({
  value,
  format,
  className = "",
  duration = 0.65,
  delay = 0.05,
  prefix = "",
  suffix = "",
}: AnimatedNumberProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  const formattedStr = format ? format(value) : value.toLocaleString();
  const chars = formattedStr.split("");

  // Map each character to its numeric target if it's a digit 0-9
  const digitTargets = chars.map((char) => {
    const num = parseInt(char, 10);
    return isNaN(num) ? null : num;
  });

  useGSAP(
    () => {
      if (!containerRef.current) return;
      if (typeof window === "undefined") return;

      const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const wheels = containerRef.current.querySelectorAll<HTMLSpanElement>(".digit-wheel");

      wheels.forEach((wheel, idx) => {
        const targetStr = wheel.getAttribute("data-target");
        if (targetStr === null) return;
        const target = parseInt(targetStr, 10);
        if (isNaN(target)) return;

        // Target index in DOUBLE_DIGITS is 10 + target
        // Total items = 20, so each digit step is 5% (1/20)
        const finalYPercent = -(10 + target) * 5;

        if (isReducedMotion) {
          gsap.set(wheel, { yPercent: finalYPercent });
          return;
        }

        // Animate rolling up from bottom to top
        gsap.fromTo(
          wheel,
          { yPercent: 0 },
          {
            yPercent: finalYPercent,
            duration: duration + idx * 0.06,
            delay: delay + idx * 0.03,
            ease: "power2.out",
          }
        );
      });
    },
    {
      scope: containerRef,
      dependencies: [value, duration, delay, formattedStr],
      revertOnUpdate: true,
    }
  );

  return (
    <span
      ref={containerRef}
      className={`inline-flex items-center tabular-nums font-mono ${className}`}
      role="text"
      aria-label={`${prefix}${formattedStr}${suffix}`}
    >
      {prefix && <span className="select-none">{prefix}</span>}
      {chars.map((char, idx) => {
        const target = digitTargets[idx];
        if (target === null) {
          return (
            <span key={idx} className="inline-block select-none">
              {char}
            </span>
          );
        }

        return (
          <span
            key={idx}
            className="inline-block relative overflow-hidden h-[1.15em] leading-none text-center"
            style={{ width: "1ch" }}
          >
            <span
              className="digit-wheel inline-flex flex-col select-none will-change-transform"
              data-target={target}
            >
              {DOUBLE_DIGITS.map((n, digitIdx) => (
                <span
                  key={digitIdx}
                  className="h-[1.15em] flex items-center justify-center leading-none text-inherit"
                  aria-hidden="true"
                >
                  {n}
                </span>
              ))}
            </span>
          </span>
        );
      })}
      {suffix && <span className="select-none">{suffix}</span>}
    </span>
  );
}