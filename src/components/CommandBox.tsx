"use client"
import { Button, Separator, Tooltip } from '@heroui/react'
import { usePathname, useRouter } from 'next/navigation'
import { Activity, startTransition, useMemo, useState, ViewTransition } from 'react'

const COMMANDS = ['me', 'skills', 'projects', 'experience', 'contact']

function CommandBox() {
    const router = useRouter()
    const pathname = usePathname()
    const [commandValue, setCommandValue] = useState('')
    const [logLines, setLogLines] = useState<Array<{ id: string; text: string; status?: string; statusClass?: string }>>([])
    const [showError, setShowError] = useState(false)
    const trimmedValue = commandValue.trim().toLowerCase()

    const currentRoute = useMemo(() => {
        const segments = pathname.split('/').filter(Boolean)
        if (segments[0] !== 'home') return ''
        return segments[1] || 'me'
    }, [pathname])

    const availableCommands = useMemo(() => {
        if (!currentRoute) return COMMANDS
        return COMMANDS.filter((command) => command !== currentRoute)
    }, [currentRoute])

    const suggestedCommand = useMemo(() => {
        if (!trimmedValue) return ''
        return availableCommands.find((command) => command.startsWith(trimmedValue)) || ''
    }, [availableCommands, trimmedValue])

    const showSuggestion =
        Boolean(suggestedCommand) &&
        suggestedCommand !== trimmedValue &&
        commandValue === commandValue.trim()

    const suggestionTail = showSuggestion ? suggestedCommand.slice(trimmedValue.length) : ''
    const getRandomDelay = () => 500 + Math.floor(Math.random() * 901)

    const getCommandRoute = (command: string) => {
        if (command === 'me') return '/home'
        return `/home/${command}`
    }

    const runSequence = async (command: string) => {
        const sequences: Record<string, Array<{ text: string; status: string; statusClass: string }>> = {
            me: [
                { text: 'Returning to home...', status: 'SWITCHING', statusClass: 'text-accent' },
                { text: 'Returning to home...', status: 'READY', statusClass: 'text-success' },
            ],
            skills: [
                { text: 'Analyzing core competencies...', status: 'ANALYZING', statusClass: 'text-accent' },
                { text: 'Analyzing core competencies...', status: 'INDEXING COMPLETE', statusClass: 'text-accent' },
            ],
            projects: [
                { text: 'Fetching deployed systems from GitHub...', status: 'CONNECTING', statusClass: 'text-accent' },
                { text: 'Fetching deployed systems from GitHub...', status: 'CONNECTED', statusClass: 'text-success' },
            ],
            contact: [
                { text: 'Fetching deployed systems from GitHub...', status: 'PENDING', statusClass: 'text-accent' },
                { text: 'Fetching deployed systems from GitHub...', status: 'SUCCESS', statusClass: 'text-success' },
            ],
            experience: [
                { text: 'Fetching career timeline...', status: 'COMPILING', statusClass: 'text-accent' },
                { text: 'Fetching career timeline...', status: 'READY', statusClass: 'text-success' },
            ],
        }

        const steps = sequences[command]
        if (!steps) return

        setLogLines([])
        let activeLineId = `${command}-${Date.now()}`
        for (let i = 0; i < steps.length; i += 1) {
            const step = steps[i]
            await new Promise((resolve) => setTimeout(resolve, getRandomDelay()))
            setLogLines((prev) => {
                if (i === 0) {
                    return [
                        {
                            id: activeLineId,
                            text: step.text,
                            status: step.status,
                            statusClass: step.statusClass,
                        },
                    ]
                }
                return prev.map((line) =>
                    line.id === activeLineId
                        ? {
                            ...line,
                            status: step.status,
                            statusClass: step.statusClass,
                        }
                        : line
                )
            })
        }
        startTransition(() => {
            router.push(getCommandRoute(command))
        })
    }

    const navigateToCommand = (value: string) => {
        const normalized = value.trim().toLowerCase()
        if (!normalized) return
        if (availableCommands.includes(normalized)) {
            runSequence(normalized)
            startTransition(() => {
                setShowError(false)
            })
            return
        }
        startTransition(() => {
            setShowError(true)
        })
    }
    return (
        <>
            <div className="flex flex-col grow">
                <ul className="grow pt-4">
                    {logLines.map((line) => (
                        <li key={line.id} className="flex items-center gap-2 text-sm">
                            <span className="text-field-placeholder">{line.text}</span>
                            {line.status && <span className={line.statusClass}>[{line.status}]</span>}
                        </li>
                    ))}
                </ul>




                <Separator className="my-6" />
                <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="relative flex min-w-0">
                        <Activity mode={showError ? "visible" : "hidden"} >
                            <ViewTransition enter="auto" exit="auto">
                                <div className="absolute top-0 left-0 -translate-y-full w-fit bg-danger text-foreground rounded-full p-1.5 text-xs translate-x-full font-bold">
                                    Command not found
                                </div>
                            </ViewTransition>
                        </Activity>
                        <span className="mr-1 text-field-placeholder font-bold">souvik@portfolio:$</span>
                        <div className="relative min-w-0">
                            <input
                                type="text"
                                className="relative z-10 min-w-0 bg-transparent text-command placeholder:text-muted focus:outline-none"
                                autoFocus
                                placeholder="type a command..."
                                value={commandValue}
                                onChange={(event) => {
                                    const nextValue = event.target.value
                                    setCommandValue(nextValue)
                                    const nextTrimmed = nextValue.trim().toLowerCase()
                                    const nextSuggested = nextTrimmed
                                        ? availableCommands.find((command) => command.startsWith(nextTrimmed)) || ''
                                        : ''
                                    startTransition(() => {
                                        setShowError(Boolean(nextTrimmed) && !nextSuggested)
                                    })
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Tab' && suggestionTail) {
                                        event.preventDefault()
                                        setCommandValue(suggestedCommand)
                                        return
                                    }
                                    if (event.key === 'Enter') {
                                        event.preventDefault()
                                        navigateToCommand(suggestedCommand || trimmedValue)
                                        return
                                    }
                                    if (event.key === 'Escape') {
                                        setCommandValue('')
                                        startTransition(() => {
                                            setShowError(false)
                                        })
                                    }
                                }}
                            />
                            {showSuggestion && (
                                <span className="pointer-events-none absolute inset-0 z-0 flex items-center text-command/40">
                                    <span className="opacity-0">{commandValue}</span>
                                    <span>{suggestionTail}</span>
                                </span>
                            )}
                        </div>

                    </div>
                    <div className="ml-auto flex items-center gap-2 text-xs text-muted">
                        {availableCommands.map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                className="rounded-md border border-segment/70 px-2 py-1 hover:text-foreground cursor-pointer hover:border-foreground transition-colors"
                                onClick={() => runSequence(tag)}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

            </div >
        </>
    )
}

export default CommandBox