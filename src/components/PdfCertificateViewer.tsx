"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

export interface CertificateData {
  id: string;
  title: string;
  issuer: string;
  category: "Hackathon" | "Course Completion" | "Professional Certification";
  recipient: string;
  date: string;
  fileName: string;
  fileSize: string;
  credentialId?: string;
  description: string;
  skills: string[];
}

interface PdfCertificateViewerProps {
  certificate: CertificateData;
  onClose: () => void;
}

export default function PdfCertificateViewer({
  certificate,
  onClose,
}: PdfCertificateViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<"document" | "details">("document");
  const dragStartRef = useRef({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleZoomIn = () => setZoom((z) => Math.min(3.0, Number((z + 0.25).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
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
        // Ignore
      }
    }
  };

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom((z) => Math.min(3.0, Math.max(0.5, Number((z + delta).toFixed(2)))));
  }, []);

  // Compute certificate styling & header based on category
  const getCategoryTheme = () => {
    switch (certificate.category) {
      case "Hackathon":
        return {
          header: "CERTIFICATE OF EXCELLENCE",
          sub: "NATIONAL HACKATHON COMPETITION AWARD",
          sealText: "WINNER / FINALIST",
          badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
          accentColor: "#b46004",
        };
      case "Course Completion":
        return {
          header: "CERTIFICATE OF COMPLETION",
          sub: "TECHNICAL ACADEMY CURRICULUM",
          sealText: "COURSE VERIFIED",
          badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/40",
          accentColor: "#3b82f6",
        };
      case "Professional Certification":
      default:
        return {
          header: "PROFESSIONAL ACCREDITATION",
          sub: "ENGINEERING STANDARDS VERIFICATION",
          sealText: "ACCREDITED",
          badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
          accentColor: "#10b981",
        };
    }
  };

  const theme = getCategoryTheme();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Certificate Viewer: ${certificate.title}`}
      className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-white/20 bg-[#0d0d0d] shadow-[0_24px_80px_rgba(0,0,0,0.95)] overflow-hidden font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header & Toolbar */}
        <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-white/[0.02] shrink-0 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-sm tracking-tight truncate max-w-[280px] sm:max-w-md">
                  {certificate.title}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold border ${theme.badgeColor} hidden sm:inline`}>
                  {certificate.category}
                </span>
              </div>
              <p className="text-[10px] text-muted truncate mt-0.5">
                {certificate.fileName} · {certificate.fileSize} · {certificate.issuer}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-white/10 bg-black/50 p-0.5 text-[10px]">
              <button
                type="button"
                onClick={() => setActiveTab("document")}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  activeTab === "document"
                    ? "bg-accent/20 text-accent font-semibold"
                    : "text-muted hover:text-foreground"
                }`}
              >
                DOCUMENT
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  activeTab === "details"
                    ? "bg-accent/20 text-accent font-semibold"
                    : "text-muted hover:text-foreground"
                }`}
              >
                DETAILS
              </button>
            </div>

            {/* Zoom Controls (Active in Document View) */}
            {activeTab === "document" && (
              <div className="flex items-center gap-1 border-l border-r border-white/10 px-2">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out (-)"
                  className="px-2 py-1 rounded border border-white/10 bg-white/[0.03] text-muted hover:text-foreground hover:border-white/20 transition cursor-pointer text-xs"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset Zoom & Pan"
                  className="px-2 py-1 rounded border border-white/10 bg-white/[0.03] text-accent font-semibold text-[11px] min-w-[50px] text-center hover:text-foreground transition cursor-pointer"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In (+)"
                  className="px-2 py-1 rounded border border-white/10 bg-white/[0.03] text-muted hover:text-foreground hover:border-white/20 transition cursor-pointer text-xs"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset view to 100%"
                  className="px-2 py-1 rounded border border-white/10 text-muted hover:text-foreground transition text-[10px] cursor-pointer hidden md:inline"
                >
                  RESET
                </button>
              </div>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              title="Close Viewer (Esc)"
              className="px-2.5 py-1 rounded-lg border border-white/15 bg-white/[0.05] text-muted hover:text-foreground hover:border-white/30 transition cursor-pointer text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Main Content Viewport */}
        {activeTab === "document" ? (
          <div
            ref={viewportRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            className={`relative flex-1 min-h-[460px] sm:min-h-[540px] max-h-[76vh] overflow-hidden bg-[#070707] select-none flex items-center justify-center p-4 sm:p-8 ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            title="Drag to pan · Scroll wheel or buttons to zoom (50% – 300%)"
          >
            {/* Zoomable & Pannable Document Container */}
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
              }}
              className="transition-transform duration-75 ease-out shrink-0"
            >
              {/* High-Fidelity Official PDF Certificate Document Layout */}
              <div className="w-[620px] sm:w-[720px] min-h-[460px] sm:min-h-[510px] rounded-lg border-4 border-amber-600/40 bg-gradient-to-b from-[#161412] via-[#0f0e0d] to-[#141210] p-6 sm:p-8 text-neutral-100 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_0_80px_rgba(180,96,4,0.06)] relative overflow-hidden flex flex-col justify-between">
                {/* Ornamental Guilloche Inner Border */}
                <div className="absolute inset-2.5 rounded border border-amber-500/25 pointer-events-none" />
                <div className="absolute inset-3.5 rounded border-2 border-dashed border-amber-500/15 pointer-events-none" />

                {/* Decorative Corner Flourishes */}
                <span className="absolute top-4 left-4 text-amber-500/40 text-lg leading-none select-none">❖</span>
                <span className="absolute top-4 right-4 text-amber-500/40 text-lg leading-none select-none">❖</span>
                <span className="absolute bottom-4 left-4 text-amber-500/40 text-lg leading-none select-none">❖</span>
                <span className="absolute bottom-4 right-4 text-amber-500/40 text-lg leading-none select-none">❖</span>

                {/* Document Top: Issuer & Certificate Header */}
                <div className="text-center relative z-10 pt-2">
                  <div className="flex items-center justify-center gap-2 mb-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-[11px] uppercase tracking-[0.25em] text-amber-400 font-semibold">
                      {certificate.issuer}
                    </span>
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-amber-200 tracking-wider uppercase mt-1">
                    {theme.header}
                  </h1>

                  <p className="text-[10px] font-sans text-neutral-400 uppercase tracking-widest mt-1">
                    {theme.sub}
                  </p>
                </div>

                {/* Document Body: Recipient & Citation */}
                <div className="text-center my-4 relative z-10">
                  <p className="text-xs font-sans text-neutral-400 italic">
                    This official credential is proudly awarded to
                  </p>

                  <div className="my-2.5 inline-block">
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide border-b-2 border-amber-500/50 pb-1 px-4">
                      {certificate.recipient}
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm font-sans text-neutral-300 max-w-[540px] mx-auto leading-relaxed mt-2">
                    {certificate.description}
                  </p>

                  {/* Skills tags on certificate */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                    {certificate.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded border border-amber-500/30 bg-amber-950/40 text-amber-300 text-[10px] px-2 py-0.5 font-mono"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Document Footer: Signatures & Verification Seal */}
                <div className="grid grid-cols-3 items-end pt-4 border-t border-amber-500/20 relative z-10">
                  {/* Left Signature */}
                  <div className="text-center">
                    <div className="h-7 border-b border-neutral-400/50 flex items-center justify-center">
                      <span className="font-serif italic text-amber-300 text-sm opacity-90 select-none">
                        Dr. A. K. Sharma
                      </span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 block mt-1">
                      Academic / Program Director
                    </span>
                  </div>

                  {/* Center Official Gold Seal */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-16 w-16 rounded-full border-2 border-amber-400/70 bg-gradient-to-tr from-amber-700 via-amber-500 to-yellow-300 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center justify-center text-center">
                      <div className="h-full w-full rounded-full border border-black/40 bg-black/85 flex flex-col items-center justify-center p-1 text-[8px] font-bold text-amber-300 leading-tight">
                        <span>★ ★ ★</span>
                        <span className="uppercase text-[7px] tracking-tight">{theme.sealText}</span>
                        <span className="text-[7px] text-amber-400/80">OFFICIAL</span>
                      </div>
                    </div>
                    <span className="text-[8px] font-mono text-amber-400/80 mt-1">
                      {certificate.date}
                    </span>
                  </div>

                  {/* Right Signature & Credential ID */}
                  <div className="text-center">
                    <div className="h-7 border-b border-neutral-400/50 flex items-center justify-center">
                      <span className="font-serif italic text-amber-300 text-sm opacity-90 select-none">
                        Executive Committee
                      </span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 block mt-1">
                      Authorized Signatory
                    </span>
                  </div>
                </div>

                {/* Cryptographic Bottom Verification Strip */}
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[8px] text-neutral-500 font-mono">
                  <span>REF: {certificate.credentialId ? `#${certificate.credentialId}` : certificate.id}</span>
                  <span className="tracking-widest uppercase">SHA-256: 8f4b1e7...c92a [VERIFIED]</span>
                  <span>PDF FILE: {certificate.fileName}</span>
                </div>
              </div>
            </div>

            {/* Floating HUD Controller Hints */}
            <div className="absolute bottom-3 left-4 flex items-center gap-2 pointer-events-none text-[10px] text-muted font-mono bg-black/80 px-2.5 py-1.5 rounded-lg border border-white/10 backdrop-blur-md shadow-lg">
              <span>🖱 Click &amp; drag to pan</span>
              <span>·</span>
              <span>Scroll to zoom (50% – 300%)</span>
              {(pan.x !== 0 || pan.y !== 0 || zoom !== 1) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="pointer-events-auto text-accent underline ml-1 hover:text-accent/80 cursor-pointer font-bold"
                >
                  Reset View
                </button>
              )}
            </div>

            {/* Quick Zoom Pill */}
            <div className="absolute bottom-3 right-4 flex items-center gap-1 bg-black/80 p-1 rounded-lg border border-white/10 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setZoom(0.75)}
                className={`px-2 py-0.5 text-[9px] rounded ${zoom === 0.75 ? "bg-accent text-accent-foreground font-bold" : "text-muted hover:text-foreground"}`}
              >
                75%
              </button>
              <button
                type="button"
                onClick={() => setZoom(1.0)}
                className={`px-2 py-0.5 text-[9px] rounded ${zoom === 1.0 ? "bg-accent text-accent-foreground font-bold" : "text-muted hover:text-foreground"}`}
              >
                100%
              </button>
              <button
                type="button"
                onClick={() => setZoom(1.5)}
                className={`px-2 py-0.5 text-[9px] rounded ${zoom === 1.5 ? "bg-accent text-accent-foreground font-bold" : "text-muted hover:text-foreground"}`}
              >
                150%
              </button>
            </div>
          </div>
        ) : (
          /* Metadata & Verification Details Tab */
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[70vh] terminal-scrollbar text-xs">
            <div>
              <span className="text-[10px] text-muted uppercase tracking-wider block">Credential Title</span>
              <h3 className="text-base sm:text-lg font-semibold text-foreground font-sans mt-0.5">
                {certificate.title}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/10">
              <div>
                <span className="text-[10px] text-muted uppercase tracking-wider block">Issuing Organization</span>
                <span className="text-accent font-medium mt-0.5 block">{certificate.issuer}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted uppercase tracking-wider block">Verified Recipient</span>
                <span className="text-foreground font-semibold mt-0.5 block">{certificate.recipient}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/10">
              <div>
                <span className="text-[10px] text-muted uppercase tracking-wider block">Category &amp; Issue Date</span>
                <span className="text-foreground mt-0.5 block">
                  {certificate.category} · {certificate.date}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted uppercase tracking-wider block">Document File Artifact</span>
                <span className="text-muted truncate mt-0.5 block" title={certificate.fileName}>
                  {certificate.fileName} ({certificate.fileSize})
                </span>
              </div>
            </div>

            {certificate.credentialId && (
              <div className="pt-3 border-t border-white/10">
                <span className="text-[10px] text-muted uppercase tracking-wider block">Institutional ID / Reference</span>
                <span className="text-foreground font-semibold mt-0.5 block">
                  #{certificate.credentialId}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-white/10">
              <span className="text-[10px] text-muted uppercase tracking-wider block">Curriculum / Achievement Citation</span>
              <p className="mt-1 text-foreground/80 font-sans leading-relaxed text-xs">
                {certificate.description}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10">
              <span className="text-[10px] text-muted uppercase tracking-wider block mb-2">
                Demonstrated &amp; Verified Competencies
              </span>
              <div className="flex flex-wrap gap-1.5">
                {certificate.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded bg-accent/15 border border-accent/30 text-accent px-2.5 py-1 text-[11px]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer info bar */}
        <footer className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/[0.02] shrink-0 text-xs">
          <span className="text-[11px] text-success flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Verified Authentic Credential for Souvik Karmakar
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-accent text-accent-foreground px-3.5 py-1.5 font-sans text-xs font-semibold hover:opacity-90 transition cursor-pointer"
          >
            Close Viewer
          </button>
        </footer>
      </div>
    </div>
  );
}
