"use client"

import GlassSurface from '@/components/GlassSurface'
import { Separator } from '@heroui/react'
import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'

const COMMANDS = ['skills', 'projects', 'experience', 'contact']

function Home() {
    const [commandValue, setCommandValue] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const blurTimeoutRef = useRef<number | null>(null)

    const filteredCommands = useMemo(() => {
        const value = commandValue.trim().toLowerCase()
        if (!value) return COMMANDS
        return COMMANDS.filter((command) => command.startsWith(value))
    }, [commandValue])

    const closeList = () => {
        setIsOpen(false)
        setHighlightedIndex(-1)
    }
    return (
        <GlassSurface>
            <div className="relative h-full overflow-hidden backdrop-blur-3xl bg-segment/15">

                <div className="relative flex h-full flex-col px-6 py-5">
                    <div className="grow">
                        <div className="flex items-center gap-2 text-xs text-muted">
                            <span className="h-2.5 w-2.5 rounded-full bg-danger" />
                            <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                            <span className="h-2.5 w-2.5 rounded-full bg-success" />
                            <span className="ml-3 font-medium tracking-[0.2em] uppercase text-muted">portfolio shell</span>
                        </div>

                        <div className="mt-6 grid gap-6 lg:grid-cols-12 grow">
                            <section className="lg:col-span-7">
                                <div className="flex ">
                                    <ul>
                                        <li>
                                            <div className="flex ">
                                                <span className="mr-1 text-field-placeholder font-bold">user@portfolio:$</span>
                                                <span
                                                    contentEditable={false}
                                                    suppressContentEditableWarning={true}
                                                    className="focus:outline-none text-command"
                                                    autoFocus
                                                    spellCheck={false}
                                                >
                                                    whoami
                                                </span>
                                            </div>
                                        </li>
                                        <li className="text-success">
                                            <p className="">Identity Fetching <span className="uppercase">success</span></p>
                                        </li>
                                    </ul>

                                </div>

                                <h1 className="mt-2 text-4xl font-bold text-accent" style={{ fontFamily: "var(--font-plex)" }}>
                                    Souvik Karmakar
                                </h1>
                                <p className="mt-2 text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                                    Fullstack Developer &amp; AI Enthusiast
                                </p>
                                <Separator className="my-4" />
                                <p className="text-sm leading-relaxed text-muted">
                                    Passionate about crafting seamless digital experiences, I build robust web applications and explore the
                                    frontier of applied AI. I love turning complex challenges into elegant, maintainable systems.
                                </p>

                                <div className="mt-6 rounded-lg border border-segment/70 bg-overlay/60 p-4">
                                    <p className="text-xs uppercase tracking-[0.3em] text-muted">Pitch</p>
                                    <p className="mt-2 text-lg text-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                                        &ldquo;Building performant, human-first interfaces with a systems mindset.&rdquo;
                                    </p>
                                </div>
                            </section>

                            <section className="lg:col-span-5">
                                <p className="text-xs uppercase tracking-[0.35em] text-muted">System Specs</p>
                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    {[
                                        { label: "Core", value: "Distributed Systems" },
                                        { label: "Models", value: "LLM Optimization" },
                                        { label: "Runtime", value: "Rust / Go / Python" },
                                        { label: "Latency", value: "< 50ms Target" },
                                    ].map((item) => (
                                        <div key={item.label} className="rounded-lg border border-segment/70 bg-surface-secondary/70 p-3">
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{item.label}</p>
                                            <p className="mt-2 text-sm font-semibold text-foreground">{item.value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-5">
                                    <p className="text-xs uppercase tracking-[0.35em] text-muted">Logs</p>
                                    <ul className="mt-3 space-y-2 text-xs text-muted">
                                        <li className="flex items-center justify-between rounded-md border border-segment/50 bg-overlay/50 px-3 py-2">
                                            <span>[2023-11-20]</span>
                                            <span className="text-foreground">deploy: neural_engine_v4</span>
                                        </li>
                                        <li className="flex items-center justify-between rounded-md border border-segment/50 bg-overlay/50 px-3 py-2">
                                            <span>[2024-01-15]</span>
                                            <span className="text-foreground">init: project_genesis</span>
                                        </li>
                                        <li className="flex items-center justify-between rounded-md border border-segment/50 bg-overlay/50 px-3 py-2">
                                            <span>[2024-03-02]</span>
                                            <span className="text-warning">upgrade: k8s_cluster_main</span>
                                        </li>
                                    </ul>
                                </div>
                            </section>
                        </div>
                    </div>
                    <Separator className="my-6" />

                    <div className="mt-auto flex flex-wrap items-center gap-3 text-sm">
                        <div className="relative flex min-w-0">
                            <span className="mr-1 text-field-placeholder font-bold">user@portfolio:$</span>
                            <input
                                type="text"
                                className="min-w-0 bg-transparent text-command placeholder:text-muted focus:outline-none"
                                autoFocus
                                placeholder="type a command..."
                                value={commandValue}
                                onChange={(event) => {
                                    setCommandValue(event.target.value)
                                    setIsOpen(true)
                                    setHighlightedIndex(-1)
                                }}
                                onFocus={() => {
                                    if (blurTimeoutRef.current) {
                                        window.clearTimeout(blurTimeoutRef.current)
                                    }
                                    setIsOpen(true)
                                }}
                                onBlur={() => {
                                    blurTimeoutRef.current = window.setTimeout(() => {
                                        closeList()
                                    }, 120)
                                }}
                                onKeyDown={(event) => {
                                    if (!isOpen) return
                                    if (event.key === 'ArrowDown') {
                                        event.preventDefault()
                                        setHighlightedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1))
                                    } else if (event.key === 'ArrowUp') {
                                        event.preventDefault()
                                        setHighlightedIndex((prev) => Math.max(prev - 1, 0))
                                    } else if (event.key === 'Enter') {
                                        if (highlightedIndex >= 0) {
                                            event.preventDefault()
                                            const selected = filteredCommands[highlightedIndex]
                                            if (selected) {
                                                setCommandValue(selected)
                                                closeList()
                                            }
                                        }
                                    } else if (event.key === 'Escape') {
                                        closeList()
                                    }
                                }}
                            />
                            {isOpen && filteredCommands.length > 0 && (
                                <div className="absolute left-0 top-full z-10 mt-2 w-full min-w-[220px] rounded-md border border-segment/70 bg-surface-secondary/90 p-1 text-xs shadow-[0_0_0_1px_var(--segment)]">
                                    {filteredCommands.map((command, index) => (
                                        <button
                                            key={command}
                                            type="button"
                                            className={`flex w-full items-center justify-between rounded-sm px-2 py-1 text-left uppercase tracking-[0.25em] ${
                                                index === highlightedIndex
                                                    ? 'bg-accent/20 text-accent'
                                                    : 'text-muted hover:text-foreground'
                                            }`}
                                            onMouseEnter={() => setHighlightedIndex(index)}
                                            onMouseDown={(event) => {
                                                event.preventDefault()
                                                setCommandValue(command)
                                                closeList()
                                            }}
                                        >
                                            <span>{command}</span>
                                            <span className="text-[10px] text-muted">enter</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="ml-auto flex items-center gap-2 text-xs text-muted">
                            {['skills', 'projects', 'experience', 'contact'].map((tag) => (
                                <Link key={tag} href={`/home/${tag}`} className="rounded-md border border-segment/70 px-2 py-1 hover:text-foreground cursor-pointer hover:border-foreground transition-colors">
                                    {tag}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </GlassSurface>
    )
}

export default Home