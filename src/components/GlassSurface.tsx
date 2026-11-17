"use client";

import React from "react";

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
  style?: React.CSSProperties;
}

const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  width = "100%",
  height = "100%",
  borderRadius = 16,
  className = "",
  style = {},
}) => {
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border border-segment/60 bg-surface/80 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_0_0_rgba(255,255,255,0.08)] transition-all ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius: `${borderRadius}px`,
        ...style,
      }}
    >
      <div className="w-full h-full flex flex-col relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassSurface;
