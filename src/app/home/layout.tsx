import React from 'react'

function HomeLayout({ children, rightSide }: { children: React.ReactNode; rightSide: React.ReactNode }) {
    return (
        <main className="min-h-dvh bg-background text-foreground p-2 md:p-4 grid grid-cols-4 gap-3">
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