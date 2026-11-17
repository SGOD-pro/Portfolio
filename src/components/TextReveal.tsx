"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

interface TextRevealProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  delay?: number;
  duration?: number;
  stagger?: number;
}

/**
 * Snappy Kinetic Letter-by-Letter Page Header Text Reveal using GSAP.
 * - Each letter/character smoothly fades in from bottom to top (opacity 0 -> 1, y 8 -> 0).
 * - Words are wrapped in inline-block spans to preserve clean responsive wrapping.
 * - Fast, non-blocking duration (0.28s) with crisp stagger (0.015s).
 * - Full screen-reader accessibility: text preserved via aria-label.
 * - Respects prefers-reduced-motion: settles immediately.
 */
export default function TextReveal({
  text,
  className = "",
  as: Component = "h1",
  delay = 0.02,
  duration = 0.28,
  stagger = 0.015,
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      if (typeof window === "undefined") return;

      const letters = containerRef.current.querySelectorAll<HTMLSpanElement>(".reveal-char");
      if (letters.length === 0) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(letters, { opacity: 1, y: 0, clearProps: "opacity,transform" });
        return;
      }

      gsap.fromTo(
        letters,
        {
          opacity: 0,
          y: 8,
        },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          delay,
          ease: "power2.out",
          clearProps: "transform",
        }
      );
    },
    {
      scope: containerRef,
      dependencies: [text, delay, duration, stagger],
      revertOnUpdate: true,
    }
  );

  const words = text.split(" ");

  return (
    <Component
      ref={containerRef as React.Ref<never>}
      className={className}
      aria-label={text}
    >
      <span aria-hidden="true" className="inline">
        {words.map((word, wordIdx) => (
          <span key={wordIdx} className="inline-block whitespace-nowrap">
            {Array.from(word).map((char, charIdx) => (
              <span
                key={charIdx}
                className="reveal-char inline-block will-change-transform will-change-opacity"
              >
                {char}
              </span>
            ))}
            {wordIdx < words.length - 1 && (
              <span className="reveal-char inline-block">&nbsp;</span>
            )}
          </span>
        ))}
      </span>
    </Component>
  );
}
