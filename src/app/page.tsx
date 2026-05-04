"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, ViewTransition, startTransition, addTransitionType } from "react";

export default function Index() {
  const editableRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = editableRef.current;
    if (!el) {
      return;
    }
    el.focus();
    const selection = window.getSelection();
    if (!selection) {
      return;
    }
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        startTransition(() => {
          addTransitionType('slide');
          router.push('/home');
        });

        console.log("Enter pressed");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
 
      <main className="bg-background flex items-center justify-center min-h-dvh flex-col p-2">
        <div className="rounded-xl overflow-hidden min-w-sm">
          <header className="h-12 bg-default flex items-center justify-start gap-1 border-b border-segment px-3 caret-accent">
            <span className="rounded-full bg-danger p-1.5 cursor-pointer" />
            <span className="rounded-full bg-warning p-1.5 cursor-pointer" />
            <span className="rounded-full bg-surface p-1.5 cursor-pointer" />
          </header>
          <aside className="p-4 px-3 bg-surface flex text-sm items-center">
            <span className="mr-1 text-field-placeholder">user@portfolio:$</span>
            <div className="flex ">
              <span
                ref={editableRef}
                contentEditable={false}
                suppressContentEditableWarning={true}
                className="focus:outline-none text-accent"
                autoFocus
                spellCheck={false}
              >
                whoami
              </span>
              <div className="cursor-blink relative rounded-2xl"></div>
            </div>
          </aside>


        </div>
        <h5 className="animate-pulse text-center text-3xl text-segment font-bold translate-y-full">Press Enter</h5>
      </main>
  );
}
