"use client";

import { StaticCodeFallback } from "@/components/StaticCodeFallback";

export default function Loading() {
  return (
    <div className="w-full flex items-center justify-center p-4">
      <StaticCodeFallback color="#D63825" height={220} />
    </div>
  );
}
