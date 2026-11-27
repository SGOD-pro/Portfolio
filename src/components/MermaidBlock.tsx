"use client";

import React, { useEffect, useId, useRef, useState, useCallback } from "react";

interface MermaidBlockProps {
  code: string;
}

export default function MermaidBlock({ code }: MermaidBlockProps) {
  const uniqueId = useId().replace(/:/g, "_");
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgHtml, setSvgHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  // Natural height of the rendered SVG (px); 0 = not yet measured
  const [svgNaturalHeight, setSvgNaturalHeight] = useState(0);
  const svgWrapperRef = useRef<HTMLDivElement>(null);

  // Drag tracking
  const dragStartRef = useRef({ x: 0, y: 0 });
  // Multi-touch tracking for pinch zoom
  const touchStateRef = useRef<{
    initialDist: number;
    initialZoom: number;
    initialPan: { x: number; y: number };
    lastCenter: { x: number; y: number };
  } | null>(null);

  const [shouldRender, setShouldRender] = useState(false);

  // Only trigger heavy mermaid import & SVG layout when diagram approaches viewport
  useEffect(() => {
    if (shouldRender) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setShouldRender(true));
      return () => cancelAnimationFrame(id);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldRender]);

  useEffect(() => {
    if (!shouldRender) return;
    let isCancelled = false;

    async function yieldToMain() {
      const w = window as unknown as { scheduler?: { yield?: () => Promise<void> } };
      if (w.scheduler && typeof w.scheduler.yield === "function") {
        await w.scheduler.yield();
      } else {
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
      }
    }

    async function renderDiagram() {
      try {
        setError(null);
        const mermaid = (await import("mermaid")).default;
        if (isCancelled) return;
        await yieldToMain();
        if (isCancelled) return;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            darkMode: true,
            background: "#0D1915",
            primaryColor: "#243E33",
            primaryTextColor: "#F7F7F2",
            primaryBorderColor: "#9CAF88",
            lineColor: "#9CAF88",
            secondaryColor: "#15271F",
            tertiaryColor: "#264235",
            mainBkg: "#15271F",
            nodeBorder: "#9CAF88",
            clusterBkg: "#0D1915",
            clusterBorder: "rgba(247, 247, 242, 0.15)",
            fontSize: "12px",
            fontFamily: "var(--font-mono, monospace)",
          },
          securityLevel: "loose",
        });

        const id = `mermaid_${uniqueId}_${Date.now()}`;
        const cleanCode = code.trim();
        const { svg } = await mermaid.render(id, cleanCode);

        if (!isCancelled) {
          setSvgHtml(svg);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Failed to parse mermaid diagram");
        }
      }
    }

    renderDiagram();

    return () => {
      isCancelled = true;
    };
  }, [code, uniqueId, shouldRender]);

  const handleZoomIn = () => setZoom((z) => Math.min(5.0, Number((z + 0.25).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.4, Number((z - 0.25).toFixed(2))));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Measure the SVG's actual rendered height (not viewBox units, which can be much larger)
  const measureSvgHeight = useCallback(() => {
    if (!svgWrapperRef.current) return;
    const svg = svgWrapperRef.current.querySelector("svg");
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    if (rect.height > 0) {
      const unscaled = rect.height / (zoom || 1);
      setSvgNaturalHeight(Math.max(140, Math.min(Math.round(unscaled), 680)));
    }
  }, [zoom]);

  // Re-measure whenever SVG HTML changes or container resizes
  useEffect(() => {
    if (!svgHtml) return;
    const id = requestAnimationFrame(measureSvgHeight);
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") {
      return () => cancelAnimationFrame(id);
    }
    const ro = new ResizeObserver(() => {
      measureSvgHeight();
    });
    ro.observe(el);
    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
    };
  }, [svgHtml, measureSvgHeight]);

  // Native wheel handler with non-passive listener for Ctrl + Scroll zooming (preventing page zoom / scroll)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheelNative = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;
        setZoom((z) => Math.min(5.0, Math.max(0.4, Number((z + zoomDelta).toFixed(2)))));
      }
    };

    container.addEventListener("wheel", onWheelNative, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheelNative);
    };
  }, []);

  // Mouse / Pointer handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary button for mouse
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.pointerType === "touch") return; // Touch handled by touch events for pinch-to-zoom

    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || e.pointerType === "touch") return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore if already released
      }
    }
  };

  const isTouchPanActive = zoom > 1 || pan.x !== 0 || pan.y !== 0;

  // Touch handlers for mobile (Single finger pan only when zoomed/panned + Two-finger pinch-to-zoom)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      if (!isTouchPanActive) return;
      // Single finger drag only when zoomed in or panned
      const touch = e.touches[0];
      setIsDragging(true);
      dragStartRef.current = {
        x: touch.clientX - pan.x,
        y: touch.clientY - pan.y,
      };
      touchStateRef.current = null;
    } else if (e.touches.length === 2) {
      // Two-finger pinch-to-zoom
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const centerX = (t1.clientX + t2.clientX) / 2;
      const centerY = (t1.clientY + t2.clientY) / 2;

      touchStateRef.current = {
        initialDist: dist,
        initialZoom: zoom,
        initialPan: { ...pan },
        lastCenter: { x: centerX, y: centerY },
      };
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      setPan({
        x: touch.clientX - dragStartRef.current.x,
        y: touch.clientY - dragStartRef.current.y,
      });
    } else if (e.touches.length === 2 && touchStateRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const currentCenter = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };

      const scaleChange = dist / touchStateRef.current.initialDist;
      const newZoom = Math.min(5.0, Math.max(0.4, Number((touchStateRef.current.initialZoom * scaleChange).toFixed(2))));
      setZoom(newZoom);

      const dx = currentCenter.x - touchStateRef.current.lastCenter.x;
      const dy = currentCenter.y - touchStateRef.current.lastCenter.y;
      setPan((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      touchStateRef.current.lastCenter = currentCenter;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
      touchStateRef.current = null;
    } else if (e.touches.length === 1) {
      touchStateRef.current = null;
      if (!isTouchPanActive) {
        setIsDragging(false);
        return;
      }
      // Transition back to single-finger drag when zoomed/panned
      const touch = e.touches[0];
      setIsDragging(true);
      dragStartRef.current = {
        x: touch.clientX - pan.x,
        y: touch.clientY - pan.y,
      };
    }
  };

  return (
    <div
      ref={containerRef}
      className="my-4 rounded-xl border border-border bg-surface/80 backdrop-blur-md overflow-hidden font-mono text-xs shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
    >
      {/* Control Header — no label, just controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-border bg-surface-secondary/40 text-[10px]">
        <div className="flex items-center gap-2">
          {error && (
            <span className="px-1.5 py-0.5 rounded bg-warning/10 text-warning text-[9px] border border-warning/20">
              SYNTAX FALLBACK
            </span>
          )}
        </div>

        {/* Diagram Controls (Enlarged + and - buttons, Zoom reset, No copy button, No tabs) */}
        {svgHtml && !error && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="Zoom out"
              title="Zoom out"
              className="min-w-[34px] min-h-[34px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center rounded-lg border border-border bg-surface-secondary/50 text-foreground hover:border-command hover:text-command transition active:scale-95 text-base font-bold cursor-pointer"
            >
              −
            </button>
            <button
              type="button"
              onClick={handleReset}
              aria-label="Reset zoom"
              title="Click to reset zoom to 100%"
              className="px-2.5 py-1 min-h-[34px] sm:min-h-[36px] flex items-center justify-center rounded-lg border border-border bg-surface-secondary/30 hover:border-command text-command hover:text-foreground transition text-xs font-semibold cursor-pointer"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="Zoom in"
              title="Zoom in"
              className="min-w-[34px] min-h-[34px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center rounded-lg border border-border bg-surface-secondary/50 text-foreground hover:border-command hover:text-command transition active:scale-95 text-base font-bold cursor-pointer"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleReset}
              aria-label="Reset zoom and position"
              title="Reset position and zoom"
              className="px-2.5 py-1 min-h-[34px] sm:min-h-[36px] hidden sm:flex items-center justify-center rounded-lg border border-border hover:border-command text-muted hover:text-foreground transition text-[10px] font-mono cursor-pointer"
            >
              RESET
            </button>
          </div>
        )}
      </div>

      {/* Body Content */}
      {svgHtml && !error ? (
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className={`relative w-full overflow-hidden bg-[#070e0c]/90 select-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            // Allow native vertical page scrolling on mobile when at 100% zoom & unpanned
            touchAction: isTouchPanActive ? "none" : "pan-y",
            // Dynamic height: rendered SVG height + padding (including space for bottom HUD); falls back to 280px before first measure
            height: svgNaturalHeight > 0 ? `${svgNaturalHeight + 56}px` : "280px",
            minHeight: "160px",
          }}
          title="Drag to pan · Ctrl + Scroll to zoom · Pinch on mobile"
        >
          {/* Pan & Zoom Canvas */}
          <div className="w-full h-full flex items-center justify-center p-4 pb-10 pointer-events-none">
            <div
              ref={svgWrapperRef}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
              }}
              className="w-full flex items-center justify-center transition-transform duration-75 ease-out [&_svg]:max-w-full [&_svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: svgHtml }}
            />
          </div>

          {/* Interactive Canvas HUD */}
          <div className="absolute bottom-2.5 left-3 flex items-center gap-2 pointer-events-none text-[9px] text-muted/80 font-mono bg-black/75 px-2.5 py-1.5 rounded-lg border border-border/70 backdrop-blur-md shadow-md">
            <span className="hidden sm:inline">Drag to pan · Ctrl + Scroll to zoom</span>
            <span className="sm:hidden">
              {isTouchPanActive ? "Drag to pan · Pinch to zoom" : "Pinch or + to zoom"}
            </span>
            {(pan.x !== 0 || pan.y !== 0 || zoom !== 1) && (
              <>
                <span>·</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="pointer-events-auto text-command underline hover:text-command/80 cursor-pointer"
                >
                  Reset
                </button>
              </>
            )}
          </div>
        </div>
      ) : error ? (
        <div className="p-4 bg-danger/10 text-danger text-xs space-y-2">
          <p className="font-semibold">Failed to render Mermaid diagram:</p>
          <pre className="p-3 bg-black/60 rounded overflow-x-auto text-[11px] font-mono text-muted">
            <code>{code}</code>
          </pre>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-muted text-xs">
          <span className="skeleton-shimmer h-4 w-40 rounded" />
        </div>
      )}
    </div>
  );
}
