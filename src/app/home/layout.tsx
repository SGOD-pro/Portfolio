import DotGrid from '@/components/DotBackground';
import React from 'react'

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
                {children}
            </div>
            <div className="col-span-1">
                {rightSide}
            </div>
        </main>
    )
}

export default HomeLayout