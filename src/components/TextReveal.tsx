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
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  delay?: number;
  stagger?: number;
  duration?: number;
}

/**
 * Premium letter-by-letter kinetic text reveal using GSAP.
 * - Words are wrapped with whitespace-nowrap to preserve responsive wrapping.
 * - Each letter is masked in an overflow-hidden wrapper and glides up smoothly.
 * - Fully accessible: Screen readers read the original text via aria-label.
 * - Bypasses gracefully under prefers-reduced-motion: reduce.
 */
export default function TextReveal({
  text,
  className = "",
  as: Component = "h1",
  delay = 0.18,
  stagger = 0.02,
  duration = 0.42,
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const words = text.split(" ");

  useGSAP(
    () => {
      if (!containerRef.current) return;
      if (typeof window === "undefined") return;

      const chars = containerRef.current.querySelectorAll(".split-char");
      if (!chars || chars.length === 0) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(chars, { y: "0%", opacity: 1 });
        return;
      }

      gsap.fromTo(
        chars,
        {
          y: "110%",
          opacity: 0,
        },
        {
          y: "0%",
          opacity: 1,
          duration,
          stagger,
          delay,
          ease: "power3.out",
          clearProps: "transform,opacity",
        }
      );
    },
    {
      scope: containerRef,
      dependencies: [text],
    }
  );

  return (
    <Component
      ref={containerRef as React.Ref<never>}
      className={className}
      aria-label={text}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-block">
        {words.map((word, wordIdx) => (
          <span key={wordIdx} className="inline-block whitespace-nowrap">
            {word.split("").map((char, charIdx) => (
              <span
                key={charIdx}
                className="inline-block overflow-hidden align-top pb-[0.08em] -mb-[0.08em]"
              >
                <span
                  className="split-char inline-block will-change-transform"
                  style={{ transform: "translateY(110%)", opacity: 0 }}
                >
                  {char}
                </span>
              </span>
            ))}
            {wordIdx < words.length - 1 && (
              <span className="inline-block">&nbsp;</span>
            )}
          </span>
        ))}
      </span>
    </Component>
  );
}
