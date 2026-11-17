"use client";

import { useRef, type RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export interface RevealOptions {
  selector?: string;
  distance?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
  resetOnDepsChange?: boolean;
}

/**
 * Coherent, restrained component entrance using GSAP.
 * - Single motion owner: GSAP coordinates all page and card entrances.
 * - Tracks revealed elements via WeakSet so newly loaded cards reveal cleanly without re-animating visible items.
 * - Small upward movement (8px), power2.out, ~0.3s duration, 0.04s stagger.
 * - Respects prefers-reduced-motion: reduce immediately.
 * - Cleans up inline styles once settled so layout and stacking contexts remain pristine.
 */
export function useReveal(
  containerRef: RefObject<HTMLElement | null>,
  dependencies: unknown[] = [],
  options: RevealOptions = {}
) {
  const {
    selector = "[data-reveal]",
    distance = 8,
    duration = 0.3,
    stagger = 0.04,
    delay = 0,
    resetOnDepsChange = false,
  } = options;

  const revealedElementsRef = useRef<WeakSet<Element>>(new WeakSet());

  useGSAP(
    () => {
      if (!containerRef.current) return;
      if (typeof window === "undefined") return;

      if (resetOnDepsChange) {
        revealedElementsRef.current = new WeakSet();
      }

      const container = containerRef.current;
      const allTargets = Array.from(container.querySelectorAll(selector));

      if (allTargets.length === 0) return;

      // Handle reduced motion
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        allTargets.forEach((el) => {
          gsap.set(el, { opacity: 1, y: 0, clearProps: "opacity,transform" });
          revealedElementsRef.current.add(el);
        });
        return;
      }

      // Filter only elements not yet revealed
      const newTargets = allTargets.filter(
        (el) => !revealedElementsRef.current.has(el)
      );

      if (newTargets.length === 0) return;

      // Mark targets immediately to avoid double-triggers
      newTargets.forEach((el) => revealedElementsRef.current.add(el));

      gsap.fromTo(
        newTargets,
        {
          opacity: 0,
          y: distance,
        },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          delay,
          ease: "power2.out",
          clearProps: "opacity,transform",
        }
      );
    },
    {
      scope: containerRef,
      dependencies,
      revertOnUpdate: false,
    }
  );
}
