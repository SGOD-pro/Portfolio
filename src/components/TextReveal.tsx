"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getActiveScroller } from "@/utils/scrollContainer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

interface TextRevealProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  delay?: number;
  duration?: number;
  stagger?: number;
  scrollTrigger?: boolean;
}

/**
 * Snappy Kinetic Letter-by-Letter Page Header Text Reveal using GSAP.
 * - Each letter/character smoothly fades in from bottom to top (opacity 0 -> 1, y 8 -> 0).
 * - Words are wrapped in inline-block spans to preserve clean responsive wrapping.
 * - Fast, non-blocking duration (0.28s) with crisp stagger (0.015s).
 * - Full screen-reader accessibility: text preserved via aria-label.
 * - Respects prefers-reduced-motion: settles immediately.
 * - Supports scrollTrigger to animate only when scrolled into view.
 */
export default function TextReveal({
  text,
  className = "",
  as: Component = "h1",
  delay = 0.06,
  duration = 0.38,
  stagger = 0.025,
  scrollTrigger = false,
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      if (typeof window === "undefined") return;

      const letters =
        containerRef.current.querySelectorAll<HTMLSpanElement>(".reveal-char");
      if (letters.length === 0) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(letters, {
          opacity: 1,
          y: 0,
          clearProps: "opacity,transform",
        });
        return;
      }

      // Smooth organic character float-in capped so long headings don't lag
      const effectiveStagger = Math.max(
        0.008,
        Math.min(stagger, 0.32 / Math.max(1, letters.length)),
      );

      if (!scrollTrigger) {
        gsap.fromTo(
          letters,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration,
            stagger: effectiveStagger,
            delay,
            ease: "power2.out",
            clearProps: "transform,will-change",
          },
        );
        return;
      }

      const mm = gsap.matchMedia();
      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          isMobile: "(max-width: 1023px)",
        },
        () => {
          const scrollerEl = getActiveScroller();
          gsap.fromTo(
            letters,
            { opacity: 0, y: 12 },
            {
              opacity: 1,
              y: 0,
              duration,
              stagger: effectiveStagger,
              delay: 0.04,
              ease: "power2.out",
              clearProps: "transform,will-change",
              scrollTrigger: {
                trigger: containerRef.current,
                scroller: scrollerEl,
                start: "top 92%",
                toggleActions: "play none none none",
              },
            },
          );
        },
      );
    },
    {
      scope: containerRef,
      dependencies: [text, delay, duration, stagger, scrollTrigger],
      revertOnUpdate: true,
    },
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
              <span key={charIdx} className="reveal-char inline-block">
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
