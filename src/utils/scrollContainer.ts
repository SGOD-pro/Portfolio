/**
 * Resolves the active scroll container for GSAP ScrollTrigger.
 * On desktop (>= 1024px), `HomeLayout` bounds height to `lg:h-dvh` and scrolls inside `.terminal-scrollbar`.
 * On mobile (< 1024px), `HomeLayout` expands with `min-h-dvh` and the document `window` scrolls instead.
 */
export function getActiveScroller(): Element | Window {
  if (typeof window === "undefined") return window;
  if (window.innerWidth >= 1024) {
    const el = document.querySelector<HTMLElement>(".terminal-scrollbar");
    if (el && el.scrollHeight > el.clientHeight + 2) {
      const overflowY = getComputedStyle(el).overflowY;
      if (overflowY === "auto" || overflowY === "scroll") {
        return el;
      }
    }
  }
  return window;
}
