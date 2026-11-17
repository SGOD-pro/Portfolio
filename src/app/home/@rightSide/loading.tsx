"use client";

import { StaticCodeFallback } from "@/components/3DCode";

export default function Loading() {
  return (
    <div className="w-full flex items-center justify-center p-4">
      <StaticCodeFallback color="#b46004" height={220} />
    </div>
  );
}
