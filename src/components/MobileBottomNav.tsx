"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { Home, Code, Folder, Calendar, Mail } from "lucide-react";
import useViewTransition from "@/hooks/useViewTransition";
import GlassSurface from "@/components/GlassSurface";

// ============================================================================
// MOBILE DOCK & JELLY DYNAMICS CONFIGURATION
// All physics parameters, glass optics, screen boundaries, and timings
// are defined here so you can easily customize and tune them in one place.
// ============================================================================
export const DOCK_CONFIG = {
  // --- Active / Inactive Tab Colors & Transitions ---
  /** Active link color (crisp off-white per user requirement, not sage) */
  ACTIVE_COLOR: "#f0f4f1",
  /** Inactive link color */
  INACTIVE_COLOR: "#8fa196",
  /** Active icon glow */
  ACTIVE_GLOW: "drop-shadow(0 0 6px rgba(240, 244, 241, 0.65))",
  /** Color, opacity & glow transition duration in milliseconds */
  COLOR_TRANSITION_MS: 380,

  // --- Glass Refraction & Optics ---
  /** Refraction optical strength */
  REFRACTION: 0.18,
  /** Optical depth in CSS pixels */
  GLASS_THICKNESS: 14,
  /** Lens edge curvature (stealth mode: lower curvature leaves center flat and crystal clear) */
  GLASS_BEVEL: 0.26,
  /** Bevel border width in pixels */
  GLASS_BEVEL_WIDTH: 8,
  /** Chromatic dispersion intensity */
  GLASS_DISPERSION: 0.14,
  /** Specular reflection brightness */
  GLASS_REFLECTION: 0.70,
  /** Highlight glossiness */
  GLASS_SHINE: 0.40,
  /** Glass tint color */
  GLASS_TINT: "#ffffff",
  /** Glass tint opacity */
  GLASS_TINT_OPACITY: 0.00,

  // --- Viewport & Screen Wall Boundaries ---
  /** Hard screen wall padding: pill can NEVER cross closer than this to the screen edge */
  SCREEN_WALL_PADDING: 4,
  /** Rubber-band resistance factor when dragged beyond the outer tabs */
  EDGE_RESISTANCE: 0.42,

  // --- Dragging Lift & Dimensions ---
  /** Base vertical height scale when pill is picked up / held (grow big in Y) */
  DRAG_SCALE_Y: 1.35,
  /** Base horizontal width scale when pill is picked up / held (grow big in X) */
  DRAG_SCALE_X: 1.30,
  /** Minimum vertical scale during drag (prevents snapping back to nav height) */
  MIN_DRAG_SCALE_Y: 1.12,
  /** Maximum vertical scale during drag */
  MAX_DRAG_SCALE_Y: 1.50,
  /** Minimum horizontal scale during drag */
  MIN_DRAG_SCALE_X: 1.05,
  /** Maximum horizontal scale during drag (caps the maximum momentum stretch) */
  MAX_DRAG_SCALE_X: 1.80,
  /** Duration in seconds for the lift on touch down */
  DRAG_LIFT_DURATION: 0.18,
  /** Velocity sensitivity factor for momentum stretch */
  SPEED_MOMENTUM_FACTOR: 0.022,
  /** Pixel movement threshold before pointer down becomes a drag */
  DRAG_THRESHOLD_PX: 4,

  // --- Release & Tap Jelly Springs ---
  /** Duration in seconds for the release jelly wobble to settle */
  RELEASE_DURATION: 0.58,
  /** Elastic bounce ease on drag release for both width & height (balanced jelly) */
  RELEASE_EASE: "elastic.out(1.2, 0.4)",
  /** Duration in seconds for direct tab tap transit */
  TAP_TRANSIT_DURATION: 0.22,
  /** Elastic bounce ease after a direct tab tap */
  TAP_WOBBLE_EASE: "elastic.out(1.15, 0.38)",

  // --- Layout & Dimensions ---
  /** Dock height in pixels (increased for stealth mode) */
  DOCK_HEIGHT: 64,
  /** Pill and tab item height in pixels (increased for stealth mode) */
  PILL_HEIGHT: 54,
  /** Pill width in pixels (0 = auto-fit to tab cell width; or set custom fixed px, e.g. 64) */
  PILL_WIDTH: 0,
  /** Extra width padding in pixels added to the pill (e.g. 0 to 16px) */
  PILL_EXTRA_WIDTH: 4,
  /** Inner dock padding in pixels */
  DOCK_PADDING: 6,
  /** Device pixel ratio cap for smooth 120fps WebGL rendering */
  DPR_LIMIT: 1.5,
  /** Backdrop texture padding around dock in pixels */
  SCENE_PADDING: 32,
};

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "me",
    label: "Me",
    href: "/home",
    icon: <Home className="w-5 h-5 pointer-events-none" strokeWidth={1.8} />,
  },
  {
    id: "skills",
    label: "Skills",
    href: "/home/skills",
    icon: <Code className="w-5 h-5 pointer-events-none" strokeWidth={1.8} />,
  },
  {
    id: "projects",
    label: "Projects",
    href: "/home/projects",
    icon: <Folder className="w-5 h-5 pointer-events-none" strokeWidth={1.8} />,
  },
  {
    id: "experience",
    label: "Exp",
    href: "/home/experience",
    icon: <Calendar className="w-5 h-5 pointer-events-none" strokeWidth={1.8} />,
  },
  {
    id: "contact",
    label: "Contact",
    href: "/home/contact",
    icon: <Mail className="w-5 h-5 pointer-events-none" strokeWidth={1.8} />,
  },
];

function selectedIndex(path: string) {
  if (path.startsWith("/home/achievements")) return 1;
  const found = NAV_ITEMS.findIndex((item, i) =>
    i === 0
      ? path === "/home" || path === "/home/"
      : path === item.href || path.startsWith(item.href + "/")
  );
  return Math.max(0, found);
}

/**
 * Mobile Bottom Navigation with Liquid Glass Meniscus Lens,
 * Dragging with Jelly Wobble Physics (Height/Width), and 120fps Smooth WebGL Rendering.
 */
function MobileDock() {
  const pathname = usePathname();
  const { navigate, prefetch } = useViewTransition();
  const routeIndex = selectedIndex(pathname);

  const active = useRef(routeIndex);

  const dock = useRef<HTMLDivElement>(null);
  const visual = useRef<HTMLDivElement>(null);
  const bounds = useRef<HTMLDivElement>(null);
  const moving = useRef<HTMLDivElement>(null);
  const glass = useRef<HTMLDivElement>(null);

  const paint = useRef<() => void>(() => {});
  const move = useRef<(targetIndex: number, animate: boolean) => void>(() => {});

  const [scene, setScene] = useState<HTMLCanvasElement>();
  const [ready, setReady] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  // Synchronous ref avoids stale closures when user releases quickly during drag
  const hoverIndexRef = useRef<number | null>(null);
  // Optimistic tab selection: updates immediately on click or drag without waiting for Next.js navigation
  const [optimisticIndex, setOptimisticIndex] = useState<number | null>(null);
  const [prevRouteIndex, setPrevRouteIndex] = useState(routeIndex);

  if (routeIndex !== prevRouteIndex) {
    setPrevRouteIndex(routeIndex);
    setOptimisticIndex(null);
  }

  const activeIndex = optimisticIndex !== null ? optimisticIndex : routeIndex;
  const visualActiveIndex = hoverIndex !== null ? hoverIndex : activeIndex;

  // Transient drag physics state
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartRef = useRef({
    pointerId: -1,
    startX: 0,
    dragOriginX: 0,
    pillStartX: 0,
    lastX: 0,
    lastTime: 0,
    smoothVx: 0,
    scaleX: 1,
    scaleY: 1,
  });

  // Pre-warm all mobile route chunks shortly after mount so deployed tab switches never stall on network
  useEffect(() => {
    const timer = setTimeout(() => {
      NAV_ITEMS.forEach((item) => prefetch(item.href));
    }, 350);
    return () => clearTimeout(timer);
  }, [prefetch]);

  const slots = useCallback(() => {
    return visual.current ? (Array.from(visual.current.children) as HTMLElement[]) : [];
  }, []);

  // Lightweight WebGL redraw: triggers draw() without re-uploading texture data to the GPU!
  const redraw = useCallback(() => {
    glass.current?.dispatchEvent(new Event("glass-redraw"));
  }, []);

  // Full WebGL texture refresh: only needed when the rasterized canvas actually changes
  const refresh = useCallback(() => {
    glass.current?.dispatchEvent(new Event("glass-refresh"));
  }, []);

  useEffect(() => {
    const nav = dock.current;
    const layer = visual.current;
    const pill = moving.current;
    if (!nav || !layer || !pill) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let alive = true;
    let generation = 0;
    let frame = 0;
    const images = new Map<string, Promise<HTMLImageElement>>();

    const place = (targetIndex: number, animate: boolean) => {
      const cells = Array.from(layer.children) as HTMLElement[];
      const cell = cells[targetIndex];
      if (!cell) return;

      const cellWidth = cell.offsetWidth;
      const baseWidth =
        DOCK_CONFIG.PILL_WIDTH > 0
          ? DOCK_CONFIG.PILL_WIDTH
          : cellWidth + DOCK_CONFIG.PILL_EXTRA_WIDTH;
      pill.style.width = baseWidth + "px";

      const x = layer.offsetLeft + cell.offsetLeft + (cellWidth - baseWidth) / 2;

      if (!animate || matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.killTweensOf(pill);
        gsap.set(pill, { x, scale: 1, scaleX: 1, scaleY: 1 });
        redraw();
        return;
      }

      const rawCurrentX = gsap.getProperty(pill, "x");
      const currentX = typeof rawCurrentX === "number" && !Number.isNaN(rawCurrentX) ? rawCurrentX : x;
      const distance = Math.abs(x - currentX);

      gsap.killTweensOf(pill);

      if (distance < 1) {
        // Still settle any lift scale cleanly with jelly bounce
        gsap.to(pill, {
          x,
          scale: 1.0,
          scaleX: 1.0,
          scaleY: 1.0,
          duration: DOCK_CONFIG.RELEASE_DURATION,
          ease: DOCK_CONFIG.RELEASE_EASE,
          onUpdate: redraw,
        });
        return;
      }

      // Dual-axis jelly deformation: horizontal stretch AND vertical squash
      const stretchFactor = Math.min(1.22, 1 + distance * 0.0008);
      const squashFactor = Math.max(0.88, 1 - distance * 0.0005);

      const tl = gsap.timeline({
        onComplete: redraw,
      });

      // Phase 1: Rapid elastic transit with jelly stretch & squash
      tl.to(pill, {
        x,
        scaleX: stretchFactor,
        scaleY: squashFactor,
        duration: DOCK_CONFIG.TAP_TRANSIT_DURATION,
        ease: "power2.inOut",
        onUpdate: redraw,
      });

      // Phase 2: Organic liquid wobble settle in BOTH width AND height
      tl.to(pill, {
        scale: 1.0,
        scaleX: 1.0,
        scaleY: 1.0,
        duration: DOCK_CONFIG.RELEASE_DURATION,
        ease: DOCK_CONFIG.TAP_WOBBLE_EASE,
        onUpdate: redraw,
      });
    };
    move.current = place;

    const rasterIcon = (svg: SVGSVGElement, color: string) => {
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.removeAttribute("class");
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("width", "20");
      clone.setAttribute("height", "20");
      clone.style.color = color;
      clone.style.transition = "none";
      const xml = new XMLSerializer().serializeToString(clone);
      let result = images.get(xml);
      if (!result) {
        if (images.size > 24) images.clear();
        result = new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error("Navbar icon rasterization failed."));
          image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
        });
        images.set(xml, result);
      }
      return result;
    };

    const capture = async () => {
      const ticket = ++generation;
      const cells = Array.from(layer.children) as HTMLElement[];
      if (!nav.clientWidth || cells.length !== NAV_ITEMS.length) return;

      const rect = nav.getBoundingClientRect();
      const width = nav.clientWidth;
      const height = nav.clientHeight;
      const sx = rect.width / width || 1;
      const sy = rect.height / height || 1;
      const root = nav.closest<HTMLElement>("[data-glass-scene]") || document.body;
      const pageColor = getComputedStyle(root).backgroundColor;
      const navColor = getComputedStyle(nav).backgroundColor;
      const PAD = DOCK_CONFIG.SCENE_PADDING;

      const entries = cells.map((cell) => {
        const svg = cell.querySelector("svg")!;
        const label = cell.querySelector<HTMLElement>("[data-nav-label]")!;
        const ir = svg.getBoundingClientRect();
        const lr = label.getBoundingClientRect();
        const color = DOCK_CONFIG.ACTIVE_COLOR;
        const font = getComputedStyle(label);
        return {
          image: rasterIcon(svg, color),
          color,
          text: label.textContent || "",
          ix: PAD + (ir.left - rect.left) / sx,
          iy: PAD + (ir.top - rect.top) / sy,
          iw: ir.width / sx,
          ih: ir.height / sy,
          tx: PAD + (lr.left + lr.width / 2 - rect.left) / sx,
          ty: PAD + (lr.top + lr.height / 2 - rect.top) / sy,
          font: font.fontStyle + " " + font.fontWeight + " " + font.fontSize + " " + font.fontFamily,
        };
      });

      try {
        const decoded = await Promise.all(entries.map((entry) => entry.image));
        if (!alive || ticket !== generation) return;

        const ratio = Math.min(window.devicePixelRatio || 1, DOCK_CONFIG.DPR_LIMIT);
        const w = Math.round((width + PAD * 2) * ratio);
        const h = Math.round((height + PAD * 2) * ratio);
        if (canvas.width !== w) canvas.width = w;
        if (canvas.height !== h) canvas.height = h;

        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        // 1. Page background
        ctx.fillStyle = pageColor && pageColor !== "rgba(0, 0, 0, 0)" ? pageColor : "#091512";
        ctx.fillRect(0, 0, width + PAD * 2, height + PAD * 2);

        // 2. Background dot grid so gliding across or past navbar edges refracts background dots cleanly
        ctx.fillStyle = "rgba(42, 68, 56, 0.85)";
        const dotGap = 18;
        const dotR = 1.6;
        for (let dy = dotGap / 2; dy < height + PAD * 2; dy += dotGap) {
          for (let dx = dotGap / 2; dx < width + PAD * 2; dx += dotGap) {
            ctx.beginPath();
            ctx.arc(dx, dy, dotR, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // 3. Navbar capsule fill + crisp border & inner edge highlight so the navbar boundary refracts inside the glass
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(PAD, PAD, width, height, height / 2);
        ctx.fillStyle = navColor && navColor !== "rgba(0, 0, 0, 0)" ? navColor : "rgba(11, 22, 18, 0.94)";
        ctx.fill();
        ctx.strokeStyle = "rgba(156, 175, 136, 0.42)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.roundRect(PAD + 1, PAD + 1, width - 2, height - 2, (height - 2) / 2);
        ctx.strokeStyle = "rgba(240, 244, 241, 0.14)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        entries.forEach((entry, i) => {
          ctx.drawImage(decoded[i], entry.ix, entry.iy, entry.iw, entry.ih);
          ctx.font = entry.font;
          ctx.textAlign = "center";
          ctx.textBaseline = "alphabetic";
          ctx.fillStyle = entry.color;
          const metrics = ctx.measureText(entry.text);
          const ascent = metrics.fontBoundingBoxAscent ?? metrics.actualBoundingBoxAscent;
          const descent = metrics.fontBoundingBoxDescent ?? metrics.actualBoundingBoxDescent;
          ctx.fillText(entry.text, entry.tx, entry.ty + (ascent - descent) / 2);
        });

        setScene(canvas);
        setReady(true);
        refresh();
      } catch (error) {
        if (alive && ticket === generation) {
          setScene(undefined);
          console.warn("[MobileBottomNav]", error);
        }
      }
    };

    const schedule = () => {
      if (!frame && alive && !document.hidden) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          void capture();
        });
      }
    };

    paint.current = schedule;
    place(active.current, false);
    schedule();

    const resize = new ResizeObserver(() => {
      place(active.current, false);
      schedule();
    });
    resize.observe(nav);

    const theme = new MutationObserver(schedule);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
    theme.observe(document.body, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });

    const onVisible = () => {
      if (document.hidden) {
        gsap.killTweensOf(pill);
      } else {
        place(active.current, false);
      }
    };

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const onReduced = () => place(active.current, false);
    reduced.addEventListener("change", onReduced);
    document.addEventListener("visibilitychange", onVisible);
    document.fonts.ready.then(() => { if (alive) schedule(); });
    document.fonts.addEventListener("loadingdone", schedule);

    return () => {
      alive = false;
      ++generation;
      cancelAnimationFrame(frame);
      gsap.killTweensOf(pill);
      resize.disconnect();
      theme.disconnect();
      reduced.removeEventListener("change", onReduced);
      document.removeEventListener("visibilitychange", onVisible);
      document.fonts.removeEventListener("loadingdone", schedule);
      paint.current = () => {};
      move.current = () => {};
      images.clear();
    };
  }, [redraw, refresh]);

  // Synchronize route changes smoothly without heavy texture re-capture
  useEffect(() => {
    active.current = routeIndex;
    if (!isDraggingRef.current) {
      move.current(routeIndex, true);
    }
  }, [routeIndex]);

  // Tactile Drag Physics Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const pill = moving.current;
    if (!pill) return;

    const rawCurrentX = gsap.getProperty(pill, "x");
    const currentX = typeof rawCurrentX === "number" && !Number.isNaN(rawCurrentX) ? rawCurrentX : 0;
    const rawScaleX = gsap.getProperty(pill, "scaleX");
    const rawScaleY = gsap.getProperty(pill, "scaleY");

    dragStartRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      dragOriginX: e.clientX,
      pillStartX: currentX,
      lastX: e.clientX,
      lastTime: Date.now(),
      smoothVx: 0,
      scaleX: typeof rawScaleX === "number" && !Number.isNaN(rawScaleX) ? rawScaleX : 1,
      scaleY: typeof rawScaleY === "number" && !Number.isNaN(rawScaleY) ? rawScaleY : 1,
    };
    hasDraggedRef.current = false;
    isDraggingRef.current = true;
    hoverIndexRef.current = null;

    // Note: we deliberately defer setPointerCapture until dx exceeds DRAG_THRESHOLD_PX
    // so simple clicks/taps pass straight to child <a> elements cleanly!

    gsap.killTweensOf(pill);

    // Smooth lift on pickup (power2.out avoids overshoot shaking when finger holds/moves)
    gsap.to(pill, {
      scaleX: DOCK_CONFIG.DRAG_SCALE_X,
      scaleY: DOCK_CONFIG.DRAG_SCALE_Y,
      duration: DOCK_CONFIG.DRAG_LIFT_DURATION,
      ease: "power2.out",
      onUpdate: redraw,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !moving.current || !dock.current) return;
    const pill = moving.current;
    const layer = visual.current;
    if (!layer) return;

    const initialDx = e.clientX - dragStartRef.current.startX;
    if (!hasDraggedRef.current) {
      if (Math.abs(initialDx) <= DOCK_CONFIG.DRAG_THRESHOLD_PX) return;
      hasDraggedRef.current = true;
      // Anchor drag origin at the point drag begins so there is zero 5px jump,
      // and capture current GSAP scale & stop the lift tween so nothing fights!
      dragStartRef.current.dragOriginX = e.clientX;
      dragStartRef.current.lastX = e.clientX;
      dragStartRef.current.lastTime = Date.now();
      dragStartRef.current.smoothVx = 0;

      const curSX = gsap.getProperty(pill, "scaleX");
      const curSY = gsap.getProperty(pill, "scaleY");
      dragStartRef.current.scaleX = typeof curSX === "number" && !Number.isNaN(curSX) ? curSX : DOCK_CONFIG.DRAG_SCALE_X;
      dragStartRef.current.scaleY = typeof curSY === "number" && !Number.isNaN(curSY) ? curSY : DOCK_CONFIG.DRAG_SCALE_Y;

      gsap.killTweensOf(pill);

      try {
        e.currentTarget.setPointerCapture(dragStartRef.current.pointerId);
      } catch {
        // Ignore
      }
    }

    const dx = e.clientX - dragStartRef.current.dragOriginX;

    // Filtered smooth velocity to drive organic jelly deformations with bounded dt
    const now = Date.now();
    const dt = Math.max(8, Math.min(64, now - dragStartRef.current.lastTime));
    const rawVx = (e.clientX - dragStartRef.current.lastX) / dt;
    dragStartRef.current.lastX = e.clientX;
    dragStartRef.current.lastTime = now;
    dragStartRef.current.smoothVx += (rawVx - dragStartRef.current.smoothVx) * 0.28;
    const instVx = Math.max(-10, Math.min(10, dragStartRef.current.smoothVx));
    const speed = Math.min(Math.abs(instVx) * 3.0, 8);

    const cells = slots();
    if (cells.length === 0) return;

    const tabMinX = layer.offsetLeft + cells[0].offsetLeft;
    const tabMaxX = layer.offsetLeft + cells[cells.length - 1].offsetLeft;
    const rawX = dragStartRef.current.pillStartX + dx;

    // 1. Rubber-band resistance once past the first and last tabs:
    let resistedX = rawX;
    if (rawX < tabMinX) {
      const overshoot = tabMinX - rawX;
      resistedX = tabMinX - Math.pow(overshoot, 0.76) * (DOCK_CONFIG.EDGE_RESISTANCE * 8);
    } else if (rawX > tabMaxX) {
      const overshoot = rawX - tabMaxX;
      resistedX = tabMaxX + Math.pow(overshoot, 0.76) * (DOCK_CONFIG.EDGE_RESISTANCE * 8);
    }

    // 2. HARD SCREEN WALL: Calculate screen viewport boundaries in dock local coordinates.
    // The pill can travel outside the dock tabs, but can NEVER cross outside the mobile viewport!
    const dockRect = dock.current.getBoundingClientRect();
    const screenWidth = window.innerWidth || document.documentElement.clientWidth;
    const pillWidth = pill.offsetWidth;
    const screenWallMinX = DOCK_CONFIG.SCREEN_WALL_PADDING - dockRect.left;
    const screenWallMaxX = screenWidth - DOCK_CONFIG.SCREEN_WALL_PADDING - dockRect.left - pillWidth;

    // Clamp strictly within the screen boundaries
    const clampedX = Math.max(screenWallMinX, Math.min(screenWallMaxX, resistedX));

    // Smoothly blend scale from current lift scale to velocity-adjusted scale (zero jitter/shake!)
    const targetScaleX = DOCK_CONFIG.DRAG_SCALE_X * (1 + speed * DOCK_CONFIG.SPEED_MOMENTUM_FACTOR);
    const targetScaleY = DOCK_CONFIG.DRAG_SCALE_Y * (1 - speed * (DOCK_CONFIG.SPEED_MOMENTUM_FACTOR * 0.35));

    const goalX = Math.min(
      DOCK_CONFIG.MAX_DRAG_SCALE_X,
      Math.max(DOCK_CONFIG.MIN_DRAG_SCALE_X, targetScaleX)
    );
    const goalY = Math.min(
      DOCK_CONFIG.MAX_DRAG_SCALE_Y,
      Math.max(DOCK_CONFIG.MIN_DRAG_SCALE_Y, targetScaleY)
    );

    dragStartRef.current.scaleX += (goalX - dragStartRef.current.scaleX) * 0.25;
    dragStartRef.current.scaleY += (goalY - dragStartRef.current.scaleY) * 0.25;

    gsap.set(pill, {
      x: clampedX,
      scaleX: dragStartRef.current.scaleX,
      scaleY: dragStartRef.current.scaleY,
    });
    redraw();

    // Real-time hover indicator reaction: lights up the tab passing under the pill in smooth off-white
    const pillCenter = clampedX + pill.offsetWidth / 2;
    let closestIndex = active.current;
    let minDist = Infinity;
    cells.forEach((cell, i) => {
      const cellCenter = layer.offsetLeft + cell.offsetLeft + cell.offsetWidth / 2;
      const dist = Math.abs(cellCenter - pillCenter);
      if (dist < minDist) {
        minDist = dist;
        closestIndex = i;
      }
    });

    hoverIndexRef.current = closestIndex;
    if (closestIndex !== hoverIndex) {
      setHoverIndex(closestIndex);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !moving.current) return;
    const pill = moving.current;
    const layer = visual.current;
    isDraggingRef.current = false;

    const wasDrag = hasDraggedRef.current;

    if (wasDrag) {
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore
      }
    }

    // Always clear hover immediately so it can never get stuck if a tween is cancelled
    const resolvedHover = hoverIndexRef.current;
    hoverIndexRef.current = null;
    setHoverIndex(null);

    if (!wasDrag) {
      // Simple tap/click: let handleTabClick drive position & route;
      // gently settle lift scale here only as a fallback if tapped on empty padding
      gsap.to(pill, {
        scale: 1.0,
        scaleX: 1.0,
        scaleY: 1.0,
        duration: DOCK_CONFIG.RELEASE_DURATION,
        ease: DOCK_CONFIG.RELEASE_EASE,
        onUpdate: redraw,
      });
      return;
    }

    const cells = slots();
    if (!layer || cells.length === 0) return;

    // Target index read synchronously from ref so fast drops never use stale React state
    const targetIdx = resolvedHover !== null ? resolvedHover : active.current;
    const targetCell = cells[targetIdx];
    const cellWidth = targetCell.offsetWidth;
    const baseWidth =
      DOCK_CONFIG.PILL_WIDTH > 0
        ? DOCK_CONFIG.PILL_WIDTH
        : cellWidth + DOCK_CONFIG.PILL_EXTRA_WIDTH;
    const targetX = layer.offsetLeft + targetCell.offsetLeft + (cellWidth - baseWidth) / 2;

    active.current = targetIdx;
    setOptimisticIndex(targetIdx); // Synchronize active tab with settled pill position immediately

    // Elastic Wobble Release: drops back to normal 1.0x with bouncy jelly settle on both width & height
    gsap.killTweensOf(pill);
    gsap.to(pill, {
      x: targetX,
      scale: 1.0,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: DOCK_CONFIG.RELEASE_DURATION,
      ease: DOCK_CONFIG.RELEASE_EASE,
      onUpdate: redraw,
    });

    // Navigate if dropped on a tab different from the current route
    if (targetIdx !== routeIndex) {
      const targetItem = NAV_ITEMS[targetIdx];
      if (targetItem) {
        navigate(targetItem.href);
      }
    }
  };

  const handleTabClick = (e: React.MouseEvent, index: number, href: string) => {
    e.preventDefault();
    if (hasDraggedRef.current) return;

    hoverIndexRef.current = null;
    setHoverIndex(null);
    active.current = index;
    setOptimisticIndex(index); // Synchronize active tab and pill position in lockstep
    move.current(index, true);
    navigate(href);
  };

  return (
    <nav aria-label="Mobile navigation" className="mln-root">
      <div
        ref={dock}
        className="mln-dock"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div ref={bounds} className="mln-scene-bounds" aria-hidden="true" />

        {/* Visual Icons & Text Labels */}
        <div ref={visual} className="mln-visual" aria-hidden="true">
          {NAV_ITEMS.map((item, i) => {
            const isSelected = visualActiveIndex === i;

            return (
              <div
                key={item.id}
                className={`mln-item${isSelected ? " mln-selected" : ""}`}
              >
                {item.icon}
                <span data-nav-label>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Active Indicator Pill: Liquid Glass Lens with Specular Arc & Refraction */}
        <div
          ref={moving}
          className="mln-pill will-change-transform"
          style={{ opacity: ready ? 1 : 0 }}
          aria-hidden="true"
        >
          <GlassSurface
            ref={glass}
            backdrop={scene}
            backdropRef={bounds}
            backdropFit="stretch"
            live={false}
            borderRadius={999}
            refraction={DOCK_CONFIG.REFRACTION}
            thickness={DOCK_CONFIG.GLASS_THICKNESS}
            bevel={DOCK_CONFIG.GLASS_BEVEL}
            bevelWidth={DOCK_CONFIG.GLASS_BEVEL_WIDTH}
            dispersion={DOCK_CONFIG.GLASS_DISPERSION}
            frost={0}
            distortion={0}
            reflection={DOCK_CONFIG.GLASS_REFLECTION}
            shine={DOCK_CONFIG.GLASS_SHINE}
            tint={DOCK_CONFIG.GLASS_TINT}
            tintOpacity={DOCK_CONFIG.GLASS_TINT_OPACITY}
            borderWidth={0.6}
            borderOpacity={0.25}
            maxDpr={DOCK_CONFIG.DPR_LIMIT}
            style={{ width: "100%", height: "100%" }}
          />

          {/* Apple Liquid Glass Specular Arc Rim Highlight */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.05) 35%, transparent 70%)",
              boxShadow:
                "inset 0 1px 1.5px 0 rgba(255,255,255,0.5), inset 0 -1px 2px 0 rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.45)",
            }}
          />
        </div>

        {/* Interactive Click Targets */}
        <div className="mln-controls">
          {NAV_ITEMS.map((item, i) => (
            <a
              key={item.id}
              href={item.href}
              draggable="false"
              onClick={(e) => handleTabClick(e, i, item.href)}
              onMouseEnter={() => prefetch(item.href)}
              onTouchStart={() => prefetch(item.href)}
              aria-label={item.label === "Exp" ? "Experience" : item.label}
              aria-current={i === routeIndex ? "page" : undefined}
            />
          ))}
        </div>
      </div>

      <style>{`
        .mln-root {
          position: fixed;
          bottom: calc(10px + env(safe-area-inset-bottom, 0px));
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          justify-content: center;
          padding: 0 12px;
          pointer-events: none;
        }
        .mln-dock {
          position: relative;
          width: 100%;
          max-width: 380px;
          height: ${DOCK_CONFIG.DOCK_HEIGHT}px;
          border-radius: 999px;
          background: rgba(11, 22, 18, 0.94);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.65), inset 0 0 0 1px rgba(156, 175, 136, 0.34);
          pointer-events: auto;
          isolation: isolate;
          touch-action: none;
          user-select: none;
        }
        .mln-scene-bounds {
          position: absolute;
          left: -${DOCK_CONFIG.SCENE_PADDING}px;
          top: -${DOCK_CONFIG.SCENE_PADDING}px;
          width: calc(100% + ${DOCK_CONFIG.SCENE_PADDING * 2}px);
          height: calc(100% + ${DOCK_CONFIG.SCENE_PADDING * 2}px);
          visibility: hidden;
          pointer-events: none;
        }
        .mln-visual,
        .mln-controls {
          position: absolute;
          inset: ${DOCK_CONFIG.DOCK_PADDING}px;
          display: flex;
        }
        .mln-visual {
          z-index: 0;
          pointer-events: none;
        }
        .mln-item {
          flex: 1;
          min-width: 0;
          height: ${DOCK_CONFIG.PILL_HEIGHT}px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          color: ${DOCK_CONFIG.INACTIVE_COLOR};
          opacity: 0.68;
          transform-origin: center;
          transition:
            color ${DOCK_CONFIG.COLOR_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity ${DOCK_CONFIG.COLOR_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mln-item.mln-selected {
          color: ${DOCK_CONFIG.ACTIVE_COLOR};
          opacity: 1;
        }
        .mln-item svg {
          display: block;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          filter: drop-shadow(0 0 0px rgba(240, 244, 241, 0));
          transition:
            filter ${DOCK_CONFIG.COLOR_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1),
            color ${DOCK_CONFIG.COLOR_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mln-item.mln-selected svg {
          filter: ${DOCK_CONFIG.ACTIVE_GLOW};
        }
        .mln-item [data-nav-label] {
          display: block;
          font: 400 10px/12px var(--font-mono, monospace);
          white-space: nowrap;
          letter-spacing: -0.01em;
        }
        .mln-pill {
          position: absolute;
          top: ${DOCK_CONFIG.DOCK_PADDING -1 }px;
          left: 0;
          height: ${DOCK_CONFIG.PILL_HEIGHT}px;
          border-radius: 999px;
          z-index: 1;
          pointer-events: none;
          transform-origin: center center;
        }
        .mln-controls {
          z-index: 2;
        }
        .mln-controls a {
          display: block;
          flex: 1;
          min-width: 0;
          min-height: ${DOCK_CONFIG.PILL_HEIGHT}px;
          border-radius: 999px;
          touch-action: none;
          -webkit-tap-highlight-color: transparent;
        }
        .mln-controls a:focus-visible {
          outline: 2px solid var(--focus, #9caf88);
          outline-offset: 1px;
        }
        @media (min-width: 1024px) {
          .mln-root {
            display: none;
          }
        }
        @media (forced-colors: active) {
          .mln-pill {
            display: none;
          }
          .mln-dock {
            background: Canvas;
            border: 1px solid CanvasText;
          }
          .mln-item {
            color: CanvasText;
          }
          .mln-item.mln-selected {
            color: Highlight;
          }
        }
      `}</style>
    </nav>
  );
}

/** Mount the GPU-backed dock only at the mobile breakpoint */
export default function MobileBottomNav() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const query = matchMedia("(max-width: 1023px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return mobile ? <MobileDock /> : null;
}
