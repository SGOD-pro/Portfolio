"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import useViewTransition from "@/hooks/useViewTransition";
import GlassSurface from "@/components/GlassSurface";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface TabGeometry {
  id: string;
  href: string;
  pillX: number;
  pillWidth: number;
  centerX: number;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "me",
    label: "Me",
    href: "/home",
    icon: (
      <svg className="w-5 h-5 pointer-events-none transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: "skills",
    label: "Skills",
    href: "/home/skills",
    icon: (
      <svg className="w-5 h-5 pointer-events-none transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16 18 6-6-6-6M8 6l-6 6 6 6" />
      </svg>
    ),
  },
  {
    id: "projects",
    label: "Projects",
    href: "/home/projects",
    icon: (
      <svg className="w-5 h-5 pointer-events-none transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z" />
      </svg>
    ),
  },
  {
    id: "experience",
    label: "Exp",
    href: "/home/experience",
    icon: (
      <svg className="w-5 h-5 pointer-events-none transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="16" x2="16" y1="2" y2="6" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="8" x2="8" y1="2" y2="6" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="3" x2="21" y1="10" y2="10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "contact",
    label: "Contact",
    href: "/home/contact",
    icon: (
      <svg className="w-5 h-5 pointer-events-none transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect width="20" height="16" x="2" y="4" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { navigate, prefetch } = useViewTransition();

  const navContainerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const tabsRef = useRef<TabGeometry[]>([]);

  // Transient physics refs to eliminate layout re-render jitter
  const currentXRef = useRef<number>(0);
  const currentWidthRef = useRef<number>(64);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const animatingToIdRef = useRef<string | null>(null);
  const hoverIdRef = useRef<string | null>(null);

  const dragStartRef = useRef({
    pointerX: 0,
    pillStartX: 0,
    lastX: 0,
    lastTime: 0,
    smoothVx: 0,
  });

  const [initialPillWidth, setInitialPillWidth] = useState(64);
  const [isReady, setIsReady] = useState(false);

  // Optimistic instant selection states: eliminate delay and prevent old tab from lingering
  const [optimisticTarget, setOptimisticTarget] = useState<{ targetId: string; href: string } | null>(null);
  const [dragHoverId, setDragHoverId] = useState<string | null>(null);

  // Route-derived active tab ID
  const getRouteActiveId = useCallback(() => {
    if (pathname === "/home" || pathname === "/home/") return "me";
    if (pathname.startsWith("/home/skills") || pathname.startsWith("/home/achievements")) return "skills";
    if (pathname.startsWith("/home/projects")) return "projects";
    if (pathname.startsWith("/home/experience")) return "experience";
    if (pathname.startsWith("/home/contact")) return "contact";
    return "me";
  }, [pathname]);

  const routeActiveId = getRouteActiveId();

  // Active optimistic ID: automatically superseded when route arrives at target href
  const optimisticId =
    optimisticTarget && optimisticTarget.targetId !== routeActiveId
      ? optimisticTarget.targetId
      : null;

  // Current visual active ID: immediately reflects drag proximity or click before router resolves
  const activeId = dragHoverId || optimisticId || routeActiveId;

  // Real-time Optical Lens Refraction: Physically warps, bends, and magnifies the icons passing beneath the liquid glass pill
  const updateRefraction = useCallback((pillX: number, pillW: number) => {
    const tabs = tabsRef.current;
    if (tabs.length === 0) return;

    const pillCenter = pillX + pillW / 2;
    // Lens influence zone: spans the full width of the liquid glass capsule + bevel rim
    const lensRadius = pillW * 0.75;

    tabs.forEach((tab) => {
      const btn = buttonRefs.current.get(tab.id);
      if (!btn) return;

      const d = tab.centerX - pillCenter;
      const absD = Math.abs(d);

      if (absD < lensRadius) {
        // Inside or passing through the curved bevel of the liquid glass lens
        const norm = d / lensRadius; // -1 to +1
        const normSq = norm * norm;

        // 1. Convex lens magnification: peaks at 1.14x in the clear center
        const mag = 1.0 + 0.14 * (1 - normSq);

        // 2. Snell's law optical refraction pull: light bends toward the lens center at the curved bevel
        // Peaks at norm ≈ ±0.58 (the curved meniscus boundary)
        const bendX = -norm * (1 - normSq) * 5.5;

        // 3. Tangential stretch & radial compression (physical optical distortion)
        const scaleX = mag * (1 + Math.abs(norm) * 0.08);
        const scaleY = mag * (1 - Math.abs(norm) * 0.06);

        btn.style.transform = `translate3d(${bendX.toFixed(2)}px, 0, 0) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`;
        btn.style.transition = isDraggingRef.current ? "none" : "color 0.15s ease";
      } else {
        // Outside the liquid glass lens: normal resting scale and position
        btn.style.transform = "translate3d(0, 0, 0) scale(1, 1)";
        btn.style.transition = isDraggingRef.current ? "none" : "transform 0.25s ease, color 0.15s ease";
      }
    });
  }, []);

  // Precise subpixel tab geometry measurement relative to container
  const measureTabs = useCallback(() => {
    const container = navContainerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    if (containerRect.width === 0) return;

    const metrics: TabGeometry[] = [];

    NAV_ITEMS.forEach((item) => {
      const el = buttonRefs.current.get(item.id);
      if (!el) return;

      const btnRect = el.getBoundingClientRect();
      const btnLeft = btnRect.left - containerRect.left;
      const btnWidth = btnRect.width;

      // Inset pill comfortably inside button slot with 3px margins
      const tabPillWidth = Math.max(48, Math.round(btnWidth - 6));
      const btnCenterX = btnLeft + btnWidth / 2;
      const pillX = Math.round(btnCenterX - tabPillWidth / 2);

      metrics.push({
        id: item.id,
        href: item.href,
        pillX,
        pillWidth: tabPillWidth,
        centerX: btnCenterX,
      });
    });

    if (metrics.length === NAV_ITEMS.length) {
      tabsRef.current = metrics;
      const targetId = optimisticId || routeActiveId;
      const currentActive = metrics.find((t) => t.id === targetId) || metrics[0];
      setInitialPillWidth(currentActive.pillWidth);
      currentWidthRef.current = currentActive.pillWidth;
      setIsReady(true);
      updateRefraction(currentActive.pillX, currentActive.pillWidth);
    }
  }, [optimisticId, routeActiveId, updateRefraction]);

  // Initial measurement and ResizeObserver for responsive adaptation
  useEffect(() => {
    measureTabs();

    let ro: ResizeObserver | null = null;
    if (navContainerRef.current) {
      ro = new ResizeObserver(() => {
        measureTabs();
        const targetId = optimisticId || routeActiveId;
        const target = tabsRef.current.find((t) => t.id === targetId);
        if (target && pillRef.current && !isDraggingRef.current) {
          gsap.set(pillRef.current, {
            x: target.pillX,
          });
          currentXRef.current = target.pillX;
          currentWidthRef.current = target.pillWidth;
          updateRefraction(target.pillX, target.pillWidth);
        }
      });
      ro.observe(navContainerRef.current);
    }

    return () => {
      ro?.disconnect();
    };
  }, [measureTabs, optimisticId, routeActiveId, updateRefraction]);

  // Fluid Spatial Continuity Navigation: slide pill smoothly with dual-axis jelly dynamics (ONLY transforms, zero layout reflows!)
  useEffect(() => {
    if (!isReady || !pillRef.current) return;

    const targetId = optimisticId || routeActiveId;
    const target = tabsRef.current.find((t) => t.id === targetId);
    if (!target) return;

    if (animatingToIdRef.current === targetId) {
      return;
    }

    const isReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isReduced) {
      gsap.set(pillRef.current, {
        x: target.pillX,
        scale: 1,
        scaleX: 1,
        scaleY: 1,
      });
      currentXRef.current = target.pillX;
      currentWidthRef.current = target.pillWidth;
      updateRefraction(target.pillX, target.pillWidth);
      return;
    }

    // Initial positioning on mount
    if (currentXRef.current === 0) {
      gsap.set(pillRef.current, {
        x: target.pillX,
        scale: 1,
        scaleX: 1,
        scaleY: 1,
      });
      currentXRef.current = target.pillX;
      currentWidthRef.current = target.pillWidth;
      updateRefraction(target.pillX, target.pillWidth);
      return;
    }

    const startX = currentXRef.current;
    const distance = Math.abs(target.pillX - startX);
    if (distance < 1) return;

    // Dual-axis jelly deformation: horizontal stretch AND vertical squash
    const stretchFactor = Math.min(1.22, 1 + distance * 0.0008);
    const squashFactor = Math.max(0.82, 1 - distance * 0.0007);

    gsap.killTweensOf(pillRef.current);
    animatingToIdRef.current = target.id;

    const tl = gsap.timeline({
      onComplete: () => {
        currentXRef.current = target.pillX;
        currentWidthRef.current = target.pillWidth;
        updateRefraction(target.pillX, target.pillWidth);
        animatingToIdRef.current = null;
      },
    });

    // Phase 1: Rapid elastic transit with jelly stretch & squash
    tl.to(pillRef.current, {
      x: target.pillX,
      scaleX: stretchFactor,
      scaleY: squashFactor,
      duration: 0.22,
      ease: "power2.inOut",
      onUpdate: () => {
        if (pillRef.current) {
          const x = gsap.getProperty(pillRef.current, "x") as number;
          currentXRef.current = x;
          updateRefraction(x, currentWidthRef.current);
        }
      },
    });

    // Phase 2: Organic liquid wobble settle in BOTH width AND height
    tl.to(pillRef.current, {
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 0.52,
      ease: "elastic.out(1.25, 0.35)", // Bouncy rebound on both X and Y
      onUpdate: () => {
        if (pillRef.current) {
          const x = gsap.getProperty(pillRef.current, "x") as number;
          currentXRef.current = x;
          updateRefraction(x, currentWidthRef.current);
        }
      },
    });
  }, [optimisticId, routeActiveId, isReady, updateRefraction]);

  // Physical Drag Handlers: scale lift to 1.14x, wall bounded to SCREEN BORDERS (can surpass nav, but not screen)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const pillEl = pillRef.current;
    if (!pillEl) return;

    const currentX = (gsap.getProperty(pillEl, "x") as number) || currentXRef.current;
    currentXRef.current = currentX;

    dragStartRef.current = {
      pointerX: e.clientX,
      pillStartX: currentX,
      lastX: e.clientX,
      lastTime: Date.now(),
      smoothVx: 0,
    };
    hasDraggedRef.current = false;
    isDraggingRef.current = true;
    animatingToIdRef.current = null;
    e.currentTarget.setPointerCapture(e.pointerId);

    gsap.killTweensOf(pillEl);

    // Tactile Drag Lift: elevate scale smoothly in both axes
    gsap.to(pillEl, {
      scaleX: 1.14,
      scaleY: 1.16,
      duration: 0.16,
      ease: "back.out(2)",
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !pillRef.current) return;
    const dx = e.clientX - dragStartRef.current.pointerX;
    if (Math.abs(dx) > 4) {
      hasDraggedRef.current = true;
    }

    // Filtered smooth velocity to completely prevent jitter or glitching
    const now = Date.now();
    const dt = Math.max(1, now - dragStartRef.current.lastTime);
    const rawVx = (e.clientX - dragStartRef.current.lastX) / dt;
    dragStartRef.current.lastX = e.clientX;
    dragStartRef.current.lastTime = now;
    dragStartRef.current.smoothVx += (rawVx - dragStartRef.current.smoothVx) * 0.35;
    const instVx = Math.max(-10, Math.min(10, dragStartRef.current.smoothVx));

    const tabs = tabsRef.current;
    if (tabs.length === 0) return;

    const container = navContainerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const pillW = currentWidthRef.current || 64;

    // SCREEN BORDER WALLS: The pill can surpass the nav dock, but NEVER goes off the screen!
    const screenLeftWall = -containerRect.left + 4; // 4px margin from device left edge
    const screenRightWall = (typeof window !== "undefined" ? window.innerWidth : 390) - containerRect.left - pillW - 4;

    const rawX = dragStartRef.current.pillStartX + dx;
    // Hard clamp to SCREEN BORDER WALL:
    const clampedX = Math.max(screenLeftWall, Math.min(screenRightWall, rawX));

    currentXRef.current = clampedX;

    // Jelly Jiggle on BOTH width AND height: bounded deformation without layout reflows
    const speed = Math.min(Math.abs(instVx) * 6, 12);
    const stretch = 1.14 * (1 + speed * 0.012);
    const squash = 1.16 * (1 - speed * 0.01);

    gsap.set(pillRef.current, {
      x: clampedX,
      scaleX: stretch,
      scaleY: squash,
    });

    // Optical Lens Refraction: update all tab icons/labels relative to dragged pill in real time
    updateRefraction(clampedX, pillW);

    // Real-time hover reaction: activate the icon & label passing beneath the pill
    const currentPillCenter = clampedX + pillW / 2;
    let closestId = routeActiveId;
    let minDist = Infinity;
    tabs.forEach((tab) => {
      const dist = Math.abs(tab.centerX - currentPillCenter);
      if (dist < minDist) {
        minDist = dist;
        closestId = tab.id;
      }
    });

    if (closestId !== hoverIdRef.current) {
      hoverIdRef.current = closestId;
      setDragHoverId(closestId);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !pillRef.current) return;
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    const tabs = tabsRef.current;
    if (tabs.length === 0) return;

    const currentX = currentXRef.current;
    const currentPillCenter = currentX + currentWidthRef.current / 2;

    // Find the exact closest tab to land on
    let closestTab = tabs[0];
    let minDist = Infinity;
    tabs.forEach((tab) => {
      const dist = Math.abs(tab.centerX - currentPillCenter);
      if (dist < minDist) {
        minDist = dist;
        closestTab = tab;
      }
    });

    // Optimistically lock active state to the dropped tab IMMEDIATELY (no delay, no reversion to old tab)
    setOptimisticTarget({ targetId: closestTab.id, href: closestTab.href });
    setDragHoverId(null);
    hoverIdRef.current = null;
    animatingToIdRef.current = closestTab.id;

    // Elastic Wobble Release: reset to EXACT middle of the tab with bouncy settle on both width & height
    gsap.killTweensOf(pillRef.current);
    gsap.to(pillRef.current, {
      x: closestTab.pillX,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 0.55,
      ease: "elastic.out(1.28, 0.35)", // Juicy spring settle
      onUpdate: () => {
        if (pillRef.current) {
          const x = gsap.getProperty(pillRef.current, "x") as number;
          currentXRef.current = x;
          updateRefraction(x, currentWidthRef.current);
        }
      },
      onComplete: () => {
        currentXRef.current = closestTab.pillX;
        currentWidthRef.current = closestTab.pillWidth;
        updateRefraction(closestTab.pillX, closestTab.pillWidth);
        animatingToIdRef.current = null;
      },
    });

    // Navigate to new tab if dragged to a different route
    if (hasDraggedRef.current && closestTab.id !== routeActiveId) {
      navigate(closestTab.href);
    }
  };

  const handleTabClick = (item: NavItem) => {
    if (hasDraggedRef.current) return;
    // Immediate optimistic activation: no delay, no old icon showing
    setOptimisticTarget({ targetId: item.id, href: item.href });
    navigate(item.href);
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-2.5 sm:bottom-3 inset-x-0 z-[100] flex justify-center px-3 sm:px-4 pointer-events-none lg:hidden"
    >
      {/* 
        Outer Container: OVERFLOW-VISIBLE so the liquid glass pill can float and surpass the nav without being clipped!
      */}
      <div
        ref={navContainerRef}
        className="pointer-events-auto relative flex items-center p-1.5 rounded-full max-w-[380px] w-full select-none touch-none overflow-visible min-h-[52px]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* 
          1. Dock Background: Dark Low-Opacity Backdrop with Native Blur, Amber Tint Border, and Perfect Full Capsule
             Sits at z-0 behind the pill.
        */}
        <div
          className="absolute inset-0 rounded-full bg-[#07130F]/65 backdrop-blur-md border border-[rgba(156,175,136,0.22)] shadow-[0_8px_32px_rgba(0,0,0,0.65),0_2px_8px_rgba(0,0,0,0.4)] pointer-events-none z-0"
          aria-hidden="true"
        />

        {/* 
          2. Active Indicator Pill: Real GlassSurface with optical liquid glass effect, reflection, bevel & shine!
             Sits at z-10 on TOP of the dock background, with overflow-visible so drag-lift never clips!
        */}
        <div
          ref={pillRef}
          className="absolute pointer-events-none z-10 rounded-full will-change-transform"
          style={{
            position: "absolute",
            top: "6px",
            left: 0,
            width: `${initialPillWidth}px`,
            height: "45px",
            transformOrigin: "center center",
            opacity: isReady ? 1 : 0,
          }}
          aria-hidden="true"
        >
          {/* GlassSurface WebGL layer for specular reflection, bevel lighting, and glass physics */}
          <GlassSurface
            width={initialPillWidth}
            borderRadius={9999}
            refraction={0.85}
            thickness={18}
            bevel={0.5}
            reflection={0.9}
            shine={0.85}
            distortion={0}
            dispersion={0.02}
            frost={0}
            tint="#ffffff17"
            tintOpacity={0}
            borderWidth={0.8}
            borderOpacity={0.35}
            maxDpr={1.5}
            className="w-full h-full rounded-full"
            style={{ width: "100%", height: "100%" }}
          >

          {/* Apple Liquid Glass Specular Arc & Inner Meniscus Highlights */}
        
          </GlassSurface>
        </div>

        {/* 
          3. Tab Buttons: Clickable labels and icons sitting at z-20 on top of the glass pill
             Dynamically warped, bent, and magnified by the liquid glass lens!
        */}
        {NAV_ITEMS.map((item) => {
          const isItemActive = activeId === item.id;

          return (
            <button
              key={item.id}
              ref={(el) => {
                if (el) buttonRefs.current.set(item.id, el);
                else buttonRefs.current.delete(item.id);
              }}
              type="button"
              onClick={() => handleTabClick(item)}
              onMouseEnter={() => prefetch(item.href)}
              onTouchStart={() => prefetch(item.href)}
              className={`relative z-20 flex-1 min-w-0 min-h-[44px] py-1 flex flex-col items-center justify-center gap-0.5 rounded-full text-center cursor-pointer select-none will-change-transform ${
                isItemActive
                  ? "text-command font-medium drop-shadow-[0_0_8px_rgba(156,175,136,0.65)]"
                  : "text-muted opacity-70 hover:opacity-100 hover:text-foreground"
              }`}
              aria-current={isItemActive ? "page" : undefined}
            >
              {item.icon}
              <span className="text-[10px] font-mono leading-none tracking-tight truncate max-w-full px-1">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
