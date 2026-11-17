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
  const [viewMode, setViewMode] = useState<"diagram" | "code">("diagram");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function renderDiagram() {
      try {
        setError(null);
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            darkMode: true,
            background: "#0d0d0d",
            primaryColor: "#b46004",
            primaryTextColor: "#f5f5f5",
            primaryBorderColor: "#d97706",
            lineColor: "#f59e0b",
            secondaryColor: "#1a1a1a",
            tertiaryColor: "#141414",
            mainBkg: "#141414",
            nodeBorder: "#b46004",
            clusterBkg: "#0a0a0a",
            clusterBorder: "#333333",
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
          setViewMode("code");
        }
      }
    }

    renderDiagram();

    return () => {
      isCancelled = true;
    };
  }, [code, uniqueId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  const handleZoomIn = () => setZoom((z) => Math.min(5.0, Number((z + 0.25).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only primary button
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
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

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom((z) => Math.min(5.0, Math.max(0.5, Number((z + delta).toFixed(2)))));
  }, []);

  return (
    <div className="my-4 rounded-xl border border-white/15 bg-black/60 backdrop-blur-md overflow-hidden font-mono text-xs shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      {/* Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-white/10 bg-white/[0.03] text-[10px]">
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-wider font-semibold text-accent flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            MERMAID ARCHITECTURE DIAGRAM
          </span>
          {error && (
            <span className="px-1.5 py-0.5 rounded bg-warning/10 text-warning text-[9px] border border-warning/20">
              SYNTAX FALLBACK
            </span>
          )}
        </div>

        {/* View mode toggle & diagram controls */}
        <div className="flex items-center gap-1.5">
          {!error && (
            <div className="flex items-center rounded border border-white/10 bg-black/40 p-0.5 mr-1">
              <button
                type="button"
                onClick={() => setViewMode("diagram")}
                className={`px-2 py-0.5 rounded text-[9px] transition cursor-pointer ${
                  viewMode === "diagram"
                    ? "bg-accent/20 text-accent font-semibold"
                    : "text-muted hover:text-foreground"
                }`}
              >
                DIAGRAM
              </button>
              <button
                type="button"
                onClick={() => setViewMode("code")}
                className={`px-2 py-0.5 rounded text-[9px] transition cursor-pointer ${
                  viewMode === "code"
                    ? "bg-accent/20 text-accent font-semibold"
                    : "text-muted hover:text-foreground"
                }`}
              >
                CODE
              </button>
            </div>
          )}

          {viewMode === "diagram" && svgHtml && !error && (
            <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-1">
              <button
                type="button"
                onClick={handleZoomOut}
                title="Zoom out"
                className="px-1.5 py-0.5 rounded border border-white/10 hover:border-white/20 text-muted hover:text-foreground transition cursor-pointer"
              >
                -
              </button>
              <button
                type="button"
                onClick={handleReset}
                title="Reset zoom & pan (up to 500%)"
                className="px-2 py-0.5 rounded border border-white/10 hover:border-white/20 text-accent hover:text-foreground transition text-[10px] font-semibold cursor-pointer"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                title="Zoom in (limit: 500%)"
                className="px-1.5 py-0.5 rounded border border-white/10 hover:border-white/20 text-muted hover:text-foreground transition cursor-pointer"
              >
                +
              </button>
              <button
                type="button"
                onClick={handleReset}
                title="Reset position and zoom"
                className="px-2 py-0.5 rounded border border-white/10 hover:border-white/20 text-muted hover:text-foreground transition text-[9px] cursor-pointer hidden sm:inline"
              >
                RESET
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="px-2 py-0.5 rounded border border-white/10 bg-white/[0.02] text-muted hover:text-foreground hover:border-white/20 transition cursor-pointer text-[10px]"
          >
            {copied ? "[COPIED]" : "[COPY]"}
          </button>
        </div>
      </div>

      {/* Body Content */}
      {viewMode === "diagram" && svgHtml && !error ? (
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          className={`relative w-full h-[460px] sm:h-[520px] overflow-hidden bg-[#0a0a0a]/80 select-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          title="Drag to pan · Scroll or buttons to zoom (up to 500%)"
        >
          {/* Pan & Zoom Canvas */}
          <div className="w-full h-full flex items-center justify-center p-6 pointer-events-none">
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
              }}
              className="inline-block transition-transform duration-75 ease-out [&_svg]:max-w-none [&_svg]:overflow-visible [&_svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: svgHtml }}
            />
          </div>

          {/* Interactive Canvas HUD */}
          <div className="absolute bottom-2.5 left-3 flex items-center gap-2 pointer-events-none text-[9px] text-muted/70 font-mono bg-black/70 px-2 py-1 rounded border border-white/10 backdrop-blur-sm">
            <span>🖱 Drag to pan</span>
            <span>·</span>
            <span>Zoom: 50% – 500%</span>
            {(pan.x !== 0 || pan.y !== 0 || zoom !== 1) && (
              <button
                type="button"
                onClick={handleReset}
                className="pointer-events-auto text-accent underline ml-1 hover:text-accent/80 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      ) : (
        <pre className="p-3 overflow-x-auto leading-relaxed text-foreground/90 font-mono text-[11px] bg-black/50">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
