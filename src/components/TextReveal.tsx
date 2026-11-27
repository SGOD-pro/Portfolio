"use client";

import React, { useEffect, useRef, useState } from "react";

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
 * Pure CSS Compositor-Thread Kinetic Letter-by-Letter Text Reveal.
 * - Uses CSS @keyframes (opacity + transform) instead of GSAP JS tweens so main-thread JS stays free.
 * - Optional scrollTrigger uses lightweight native IntersectionObserver to add `.text-reveal-active`.
 * - Defaults to visible static state under prefers-reduced-motion: reduce.
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
  const [revealed, setRevealed] = useState(!scrollTrigger);

  useEffect(() => {
    if (!scrollTrigger || revealed) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(id);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollTrigger, revealed]);

  const totalChars = text.length;
  const effectiveStagger = Math.max(
    0.008,
    Math.min(stagger, 0.32 / Math.max(1, totalChars))
  );
  const effectiveDelay = scrollTrigger ? 0.04 : delay;

  const words = text.split(" ");
  let charCounter = 0;

  return (
    <Component
      ref={containerRef as React.Ref<never>}
      className={`${className} ${revealed ? "text-reveal-active" : "text-reveal-pending"}`}
      aria-label={text}
      style={
        {
          "--reveal-duration": `${duration}s`,
          "--reveal-delay": `${effectiveDelay}s`,
          "--reveal-stagger": `${effectiveStagger}s`,
        } as React.CSSProperties
      }
    >
      <span aria-hidden="true" className="inline">
        {words.map((word, wordIdx) => (
          <span key={wordIdx} className="inline-block whitespace-nowrap">
            {Array.from(word).map((char, charIdx) => {
              const idx = charCounter++;
              return (
                <span
                  key={charIdx}
                  className="reveal-char inline-block"
                  style={{ "--char-i": idx } as React.CSSProperties}
                >
                  {char}
                </span>
              );
            })}
            {wordIdx < words.length - 1 && (
              <span
                className="reveal-char inline-block"
                style={{ "--char-i": charCounter++ } as React.CSSProperties}
              >
                &nbsp;
              </span>
            )}
          </span>
        ))}
      </span>
    </Component>
  );
}
