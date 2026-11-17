"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useMemo, useState } from "react";

const COMMANDS = ["me", "skills", "projects", "experience", "contact"];

function CommandBox() {
  const router = useRouter();
  const pathname = usePathname();
  const [commandValue, setCommandValue] = useState("");
  const [showError, setShowError] = useState(false);

  const trimmedValue = commandValue.trim().toLowerCase();

  const currentRoute = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] !== "home") return "me";
    return segments[1] || "me";
  }, [pathname]);

  const availableCommands = useMemo(() => {
    return COMMANDS.filter((command) => command !== currentRoute);
  }, [currentRoute]);

  const suggestedCommand = useMemo(() => {
    if (!trimmedValue) return "";
    return availableCommands.find((command) => command.startsWith(trimmedValue)) || "";
  }, [availableCommands, trimmedValue]);

  const showSuggestion =
    Boolean(suggestedCommand) &&
    suggestedCommand !== trimmedValue &&
    commandValue === commandValue.trim();

  const suggestionTail = showSuggestion ? suggestedCommand.slice(trimmedValue.length) : "";

  const getCommandRoute = (command: string) => {
    if (command === "me") return "/home";
    return `/home/${command}`;
  };

  const executeNavigation = (command: string) => {
    const normalized = command.trim().toLowerCase();
    if (!normalized) return;

    if (COMMANDS.includes(normalized)) {
      setShowError(false);
      setCommandValue("");
      startTransition(() => {
        router.push(getCommandRoute(normalized));
      });
      return;
    }

    setShowError(true);
  };

  return (
    <div className="w-full flex flex-col py-1">
      {showError && (
        <div
          role="alert"
          className="mb-2.5 text-xs rounded-md bg-danger/15 border border-danger/40 text-danger px-3 py-1.5 w-fit font-mono"
        >
          Command &quot;{trimmedValue}&quot; not found. Available: {COMMANDS.join(", ")}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] font-mono py-0.5">
        {/* Terminal Input */}
        <div className="flex items-center min-w-0 flex-1">
          <label htmlFor="terminal-nav-input" className="sr-only">
            Terminal command navigation
          </label>
          <span className="text-field-placeholder font-bold shrink-0 select-none mr-2 text-[11px] font-mono">
            souvik@portfolio:$
          </span>
          <div className="relative flex-1 min-w-0">
            <input
              id="terminal-nav-input"
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="w-full relative z-10 bg-transparent text-command placeholder:text-muted/60 focus:outline-none text-[11px] font-mono py-1 leading-normal"
              placeholder="type command (e.g. skills)..."
              value={commandValue}
              onChange={(event) => {
                const nextValue = event.target.value;
                setCommandValue(nextValue);
                if (showError) setShowError(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Tab" && suggestionTail) {
                  event.preventDefault();
                  setCommandValue(suggestedCommand);
                  return;
                }
                if (event.key === "Enter") {
                  event.preventDefault();
                  executeNavigation(suggestedCommand || trimmedValue);
                  return;
                }
                if (event.key === "Escape") {
                  setCommandValue("");
                  setShowError(false);
                }
              }}
            />
            {showSuggestion && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 flex items-center text-command/40 text-[11px] font-mono"
              >
                <span className="opacity-0">{commandValue}</span>
                <span>{suggestionTail}</span>
              </span>
            )}
          </div>
        </div>

        {/* Navigation Quick Links */}
        <nav aria-label="Section navigation" className="flex flex-wrap items-center gap-1.5 shrink-0">
          {COMMANDS.map((tag) => {
            const isActive = tag === currentRoute;
            return (
              <Link
                key={tag}
                href={getCommandRoute(tag)}
                aria-current={isActive ? "page" : undefined}
                className={`rounded px-2.5 py-0.5 text-[10px] sm:text-[11px] transition-all font-mono min-h-[24px] inline-flex items-center justify-center ${
                  isActive
                    ? "border border-accent text-accent bg-accent/20 font-semibold shadow-[0_0_8px_rgba(180,96,4,0.25)]"
                    : "border border-white/10 text-muted hover:text-foreground hover:border-white/30 hover:bg-white/[0.04]"
                }`}
              >
                {tag}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default CommandBox;
