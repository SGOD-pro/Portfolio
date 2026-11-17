"use client";

import { type RefObject } from "react";
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
 * Snappy card and component entrance using GSAP.
 * - Single motion owner: GSAP coordinates all page and card entrances.
 * - Cards and sections glide up smoothly (distance: 10px, power2.out, duration: 0.28s, stagger: 0.035s).
 * - Respects prefers-reduced-motion: settles immediately.
 * - Cleans up inline styles once settled so hover and stacking contexts remain pristine.
 */
export function useReveal(
  containerRef: RefObject<HTMLElement | null>,
  dependencies: unknown[] = [],
  options: RevealOptions = {}
) {
  const {
    selector = "[data-reveal]",
    distance = 10,
    duration = 0.28,
    stagger = 0.035,
    delay = 0.02,
  } = options;

  useGSAP(
    () => {
      if (!containerRef.current) return;
      if (typeof window === "undefined") return;

      const container = containerRef.current;
      const allTargets = Array.from(container.querySelectorAll(selector));

      if (allTargets.length === 0) return;

      // Handle reduced motion
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(allTargets, { opacity: 1, y: 0, clearProps: "opacity,transform" });
        return;
      }

      gsap.fromTo(
        allTargets,
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
      revertOnUpdate: true,
    }
  );
}
