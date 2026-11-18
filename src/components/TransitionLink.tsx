"use client";

import React from "react";
import Link, { type LinkProps } from "next/link";
import { useViewTransition } from "@/hooks/useViewTransition";

interface TransitionLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>,
    LinkProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Accessible Transition Link using React 19 concurrent navigation.
 * Prefetches target routes on hover for instant 0ms page changes,
 * and triggers smooth waterfall exit/entrance animations.
 */
export default function TransitionLink({
  href,
  children,
  className = "",
  onClick,
  onMouseEnter,
  ...props
}: TransitionLinkProps) {
  const { navigate, prefetch } = useViewTransition();

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onMouseEnter) onMouseEnter(e);
    const hrefStr = typeof href === "string" ? href : href.pathname || "";
    if (hrefStr) prefetch(hrefStr);
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);

    // Skip if default was prevented or if modified click (Cmd/Ctrl/Shift/middle click)
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.altKey ||
      e.shiftKey
    ) {
      return;
    }

    const hrefStr = typeof href === "string" ? href : href.pathname || "";
    if (hrefStr && !hrefStr.startsWith("http") && !hrefStr.startsWith("mailto:")) {
      e.preventDefault();
      navigate(hrefStr);
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={className}
      {...props}
    >
      {children}
    </Link>
  );
}
