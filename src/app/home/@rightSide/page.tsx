"use client";

import dynamic from "next/dynamic";
import { Separator } from "@heroui/react";
import LineBox from "@/components/LineBox";
import Link from "next/link";
import { StaticCodeFallback } from "@/components/3DCode";

const CodeIcon3D = dynamic(() => import("@/components/3DCode"), {
  ssr: false,
  loading: () => <StaticCodeFallback color="#b46004" height={220} />,
});

function RightSide() {
  return (
    <div className="relative flex flex-col w-full h-full p-2 sm:p-3 font-mono">
      <div className="h-[220px] w-full relative flex items-center justify-center overflow-hidden">
        <CodeIcon3D
          extrudeDepth={1.2}
          color="#b46004"
          emissiveColor="#b46004"
          size={3}
          rotationSpeed={0.3}
          metalness={0.5}
          roughness={0.8}
          bevelEnabled={true}
          bevelThickness={0.1}
          bevelSize={0.05}
          autoRotate={true}
          background="transparent"
          height={220}
          width="100%"
        />
      </div>

      <Separator className="my-4" />

      <aside className="w-full">
        <h2 className="text-xs uppercase tracking-[0.25em] text-muted font-bold">Connect</h2>
        <section className="mt-3 flex flex-col gap-2.5">
          <LineBox className="w-full">
            <Link
              href="https://github.com/SGOD-pro"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full min-w-0 flex-col gap-0.5 group py-1 focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-1 rounded"
            >
              <span className="text-muted text-xs tracking-wider uppercase group-hover:text-accent font-plex font-semibold">
                GitHub
              </span>
              <span className="truncate w-full text-command lowercase text-xs">
                github.com/SGOD-pro
              </span>
            </Link>
          </LineBox>

          <LineBox className="w-full">
            <Link
              href="https://www.linkedin.com/in/souvik-karmakar-578097274/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full min-w-0 flex-col gap-0.5 group py-1 focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-1 rounded"
            >
              <span className="text-muted text-xs tracking-wider uppercase group-hover:text-accent font-plex font-semibold">
                LinkedIn
              </span>
              <span className="truncate w-full text-command lowercase text-xs">
                linkedin.com/in/souvik-karmakar
              </span>
            </Link>
          </LineBox>

          <LineBox className="w-full">
            <Link
              href="mailto:souvik.dev07@gmail.com"
              className="flex w-full min-w-0 flex-col gap-0.5 group py-1 focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-1 rounded"
            >
              <span className="text-muted text-xs tracking-wider uppercase group-hover:text-accent font-plex font-semibold">
                Email
              </span>
              <span className="truncate w-full text-command lowercase text-xs">
                souvik.dev07@gmail.com
              </span>
            </Link>
          </LineBox>
        </section>
      </aside>
    </div>
  );
}

export default RightSide;
