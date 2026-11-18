import clsx from 'clsx';
import React from 'react';

function LineBox({children, className}: {children: React.ReactNode, className?: HTMLElement['className']}) {
    return (
        <div className={clsx("relative flex w-full border border-segment px-4 py-2 uppercase [--size:calc(var(--spacing)*2.2)]", className)}>
            <span className={clsx('tracking-widest w-full min-w-0')}>{children}</span>
            <span className="absolute -left-px -right-px -top-px h-[var(--size)] -translate-y-full border-x border-segment" />
            <span className="absolute -left-px -right-px -bottom-px h-[var(--size)] translate-y-full border-x border-segment" />
            <span className="absolute -top-px -bottom-px -left-px w-[var(--size)] -translate-x-full border-y border-segment" />
            <span className="absolute -top-px -bottom-px -right-px w-[var(--size)] translate-x-full border-y border-segment" />
        </div>
    )
}

export default LineBox