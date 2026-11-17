"use client";

import { type RefObject, useRef } from "react";
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
  /**
   * When true, clears the WeakSet so all elements animate fresh on the next
   * deps change. Use only for deliberate full-refresh scenarios (e.g. the
   * project detail panel replacing its entire content).
   */
  resetOnDepsChange?: boolean;
}

/**
 * Snappy card and component entrance using GSAP.
 *
 * Key invariant: an element is animated exactly once.
 * A WeakSet tracks already-revealed elements so dep changes (data arriving,
 * loading flags flipping) only animate genuinely new DOM nodes, never
 * re-hiding and re-showing content the user can already see.
 *
 * - revertOnUpdate: false — GSAP never touches inline styles it has already
 *   settled, so CSS hover transitions on background-color/border-color
 *   continue to work without interference.
 * - Respects prefers-reduced-motion: immediately settles all targets.
 * - Cleans up inline styles once settled so stacking contexts stay pristine.
 */
export function useReveal(
  containerRef: RefObject<HTMLElement | null>,
  dependencies: unknown[] = [],
  options: RevealOptions = {}
) {
  const {
    selector = "[data-reveal]",
    distance = 20,
    duration = 0.5,
    stagger = 0.1,
    delay = 0.02,
    resetOnDepsChange = false,
  } = options;

  // Persists across re-renders; tracks which elements have been revealed.
  const revealedRef = useRef(new WeakSet<Element>());

  useGSAP(
    () => {
      if (!containerRef.current) return;
      if (typeof window === "undefined") return;

      const container = containerRef.current;

      // Allow caller to deliberately reset for full content replacement.
      if (resetOnDepsChange) {
        revealedRef.current = new WeakSet<Element>();
      }

      const allTargets = Array.from(container.querySelectorAll(selector));

      // Only animate elements that have NOT been revealed yet.
      const fresh = allTargets.filter((el) => !revealedRef.current.has(el));
      if (fresh.length === 0) return;

      // Mark them revealed immediately so concurrent dep fires don't double-animate.
      fresh.forEach((el) => revealedRef.current.add(el));

      // Handle reduced motion — settle without animation.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(fresh, { opacity: 1, y: 0, clearProps: "opacity,transform" });
        return;
      }

      gsap.fromTo(
        fresh,
        { opacity: 0, y: distance },
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
