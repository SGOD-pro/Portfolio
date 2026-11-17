"use client";

import { useRef, type RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

interface RevealOptions {
  selector?: string;
  distance?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
  once?: boolean;
}

/**
 * Premium text and component directional reveal using GSAP.
 * Strictly adheres to animations.md & official GreenSock React contract:
 * - Scoped via useGSAP hook with automatic context cleanup.
 * - Prevents jitter by not re-animating already visible elements on background state updates.
 * - Delays entry slightly (0.16s) to allow page transitions to settle smoothly first.
 * - Bypasses animation under prefers-reduced-motion: reduce.
 * - Cleans up inline styles with clearProps: "opacity,transform" once settled.
 */
export function useReveal(
  containerRef: RefObject<HTMLElement | null>,
  dependencies: unknown[] = [],
  options: RevealOptions = {}
) {
  const {
    selector = "[data-reveal]",
    distance = 10,
    duration = 0.32,
    stagger = 0.04,
    delay = 0.16,
    once = true,
  } = options;

  const hasAnimatedRef = useRef(false);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      if (typeof window === "undefined") return;

      if (once && hasAnimatedRef.current) {
        return;
      }

      const targets = containerRef.current.querySelectorAll(selector);
      if (!targets || targets.length === 0) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(targets, { opacity: 1, y: 0 });
        hasAnimatedRef.current = true;
        return;
      }

      hasAnimatedRef.current = true;

      gsap.fromTo(
        targets,
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
