import React from "react";

export interface StaticCodeFallbackProps {
  color?: string;
  height?: number | string;
  className?: string;
}

export function StaticCodeFallback({
  color = "#D63825",
  height = 220,
  className = "",
}: StaticCodeFallbackProps) {
  return (
    <div
      className={`flex items-center justify-center w-full select-none ${className}`}
      style={{ height }}
      aria-label="Code icon"
    >
      <div className="relative flex items-center justify-center p-6 rounded-2xl border border-border bg-surface-secondary/40 shadow-inner">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          className="w-20 h-20"
          fill="none"
        >
          <path
            fill={color}
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.218 3.216a.75.75 0 0 0-1.436-.431l-3 10a.75.75 0 0 0 1.436.43zM4.53 4.97a.75.75 0 0 1 0 1.06L2.56 8l1.97 1.97a.75.75 0 0 1-1.06 1.06l-2.5-2.5a.75.75 0 0 1 0-1.06l2.5-2.5a.75.75 0 0 1 1.06 0m6.94 6.06a.75.75 0 0 1 0-1.06L13.44 8l-1.97-1.97a.75.75 0 0 1 1.06-1.06l2.5 2.5a.75.75 0 0 1 0 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0"
          />
        </svg>
      </div>
    </div>
  );
}

export default StaticCodeFallback;
