"use client"
import DotGrid from '@/components/DotBackground';
import GlassSurface from '@/components/GlassSurface';
import React, { ViewTransition } from 'react'
import "./animation.css"
function HomeLayout({ children, rightSide }: { children: React.ReactNode; rightSide: React.ReactNode }) {
    return (
        <main className="min-h-dvh bg-background text-foreground p-2 md:p-4 grid grid-cols-4 gap-3">
            <div className="fixed h-full w-full left-0 top-0">
                <DotGrid
                    dotSize={3}
                    gap={20}
                    baseColor="#282727"
                    activeColor="#b46004"
                    proximity={140}
                    shockRadius={250}
                    shockStrength={5}
                    resistance={750}
                    returnDuration={1.5}
                />
            </div>
            <div className="col-span-3">
                <GlassSurface>
                    <div className="shadow-[0_0_0_1px_var(--segment)] h-full w-full overflow-hidden relative">
                        <div className="absolute inset-0 backdrop-blur-3xl bg-segment/15 pointer-events-none" />

                        {/* ViewTransition wraps a clean div with NO filters/blur */}
                        <ViewTransition name="page-content" default="slide-page">
                            <div className="px-6 py-5 h-full w-full relative z-10">
                                {children}
                            </div>
                        </ViewTransition>
                    </div>
                </GlassSurface>
            </div>
            <div className="col-span-1">
                {rightSide}
            </div>
        </main>
    )
}

export default HomeLayout