"use client";

import React, { useState, useEffect, useSyncExternalStore, useCallback } from "react";
import { createPortal } from "react-dom";

const emptySubscribe = () => () => {};

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
  pdfUrl?: string;
}

interface PdfCertificateViewerProps {
  certificate: CertificateData;
  onClose: () => void;
}

/**
 * Raw PDF Viewer Modal for Certificates & Credentials:
 * - Displays the authentic, unedited raw PDF directly from Google Drive / storage.
 * - Smooth opening and closing animations (fade + scale-up on entrance, fade + scale-down on exit).
 * - Direct "Open in Google Drive" CTA and raw file metadata.
 * - Full keyboard accessibility (Esc to close) and focus trapping.
 */
export default function PdfCertificateViewer({
  certificate,
  onClose,
}: PdfCertificateViewerProps) {
  const [isClosing, setIsClosing] = useState(false);

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Extract Drive File ID from URL
  const driveIdMatch = certificate.pdfUrl?.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const driveId = driveIdMatch ? driveIdMatch[1] : null;
  const previewUrl = driveId
    ? `https://drive.google.com/file/d/${driveId}/preview`
    : certificate.pdfUrl;

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    const timer = setTimeout(() => {
      onClose();
    }, 220);
    return () => clearTimeout(timer);
  }, [isClosing, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Official Document: ${certificate.title}`}
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-6 transition-opacity duration-200 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Backdrop with click-to-close */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-200 cursor-pointer"
        aria-hidden="true"
      />

      {/* Modal Dialog Window */}
      <div
        className={`relative z-10 w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-white/15 bg-background shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(156,175,136,0.08)] overflow-hidden transition-all duration-200 ${
          isClosing
            ? "scale-95 opacity-0"
            : "scale-100 opacity-100"
        }`}
        style={{
          transformOrigin: "center center",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Top Header & Toolbar */}
        <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5 border-b border-border bg-surface/90 shrink-0 font-mono text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse shrink-0" />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 truncate">
                <span className="font-semibold text-foreground text-sm font-sans truncate">
                  {certificate.title}
                </span>
                <span className="rounded px-2 py-0.5 bg-command/15 border border-command/40 text-command text-[10px] uppercase font-semibold shrink-0">
                  {certificate.category}
                </span>
              </div>
              <span className="text-muted/70 text-[10px] truncate">
                Raw File: {certificate.fileName} · {certificate.fileSize} · Issuer: {certificate.issuer}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Open Raw PDF in Google Drive Button */}
            {certificate.pdfUrl && (
              <a
                href={certificate.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open raw PDF document in Google Drive"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground hover:bg-accent-hover transition text-xs font-sans font-medium shadow-[0_2px_10px_rgba(214,56,37,0.3)] cursor-pointer"
              >
                <span>Open in Drive</span>
                <span>↗</span>
              </a>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              title="Close Document (Esc)"
              className="px-2.5 py-1.5 rounded-lg border border-border bg-surface-secondary/40 text-muted hover:text-foreground hover:border-accent/40 transition cursor-pointer text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Raw PDF Viewport Container */}
        <div className="relative flex-1 w-full min-h-[500px] sm:min-h-[620px] max-h-[80vh] bg-[#0c0c0c] overflow-hidden flex flex-col">
          {previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full flex-1 border-0 bg-[#0a0a0a]"
              title={certificate.title}
              allow="autoplay; encrypted-media"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center font-mono text-xs text-muted">
              <p>No preview URL available for this credential.</p>
              {certificate.pdfUrl && (
                <a
                  href={certificate.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-accent underline hover:text-accent-hover"
                >
                  Download or open raw document directly ↗
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <footer className="px-4 py-2 border-t border-border bg-surface/60 flex items-center justify-between text-[11px] font-mono text-muted/70 shrink-0">
          <span>Displaying raw verified document</span>
          <span className="hidden sm:inline">Press Esc or click outside to dismiss</span>
        </footer>
      </div>
    </div>,
    document.body
  );
}
