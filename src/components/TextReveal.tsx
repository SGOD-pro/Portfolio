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
  mode?: "heading" | "words";
  delay?: number;
  duration?: number;
  stagger?: number;
}

/**
 * Restrained whole-heading / word kinetic reveal using GSAP.
 * - Text is NEVER permanently hidden behind inline opacity styles.
 * - Entire heading or words glide up with small displacement (8px).
 * - Full accessibility: standard DOM text preserved for selection, copying, and screen readers.
 * - Immediately bypasses under prefers-reduced-motion: reduce.
 */
export default function TextReveal({
  text,
  className = "",
  as: Component = "h1",
  mode = "heading",
  delay = 0,
  duration = 0.32,
  stagger = 0.04,
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      if (typeof window === "undefined") return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(containerRef.current, { opacity: 1, y: 0 });
        return;
      }

      if (mode === "heading") {
        gsap.fromTo(
          containerRef.current,
          { opacity: 0, y: 8 },
          {
            opacity: 1,
            y: 0,
            duration,
            delay,
            ease: "power2.out",
            clearProps: "opacity,transform",
          }
        );
      } else {
        const words = containerRef.current.querySelectorAll(".reveal-word");
        if (words.length > 0) {
          gsap.fromTo(
            words,
            { opacity: 0, y: 6 },
            {
              opacity: 1,
              y: 0,
              duration: 0.28,
              stagger,
              delay,
              ease: "power2.out",
              clearProps: "opacity,transform",
            }
          );
        }
      }
    },
    {
      scope: containerRef,
      dependencies: [text, mode],
    }
  );

  if (mode === "words") {
    const wordsList = text.split(" ");
    return (
      <Component ref={containerRef as React.Ref<never>} className={className}>
        {wordsList.map((word, i) => (
          <span key={i} className="reveal-word inline-block">
            {word}
            {i < wordsList.length - 1 && "\u00A0"}
          </span>
        ))}
      </Component>
    );
  }

  return (
    <Component ref={containerRef as React.Ref<never>} className={className}>
      {text}
    </Component>
  );
}
