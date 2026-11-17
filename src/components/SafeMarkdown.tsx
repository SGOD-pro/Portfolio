"use client";

import React, { useState } from "react";
import { resolveMarkdownUrl } from "@/lib/markdown/resolveUrl";
import MermaidBlock from "@/components/MermaidBlock";

export { resolveMarkdownUrl };

export interface SafeMarkdownProps {
  content: string;
  repo: string; // "owner/repo" or "repo"
  branch?: string;
  docPath?: string;
  className?: string;
  htmlUrl?: string;
}

const MAX_DOCUMENT_BYTES = 256 * 1024; // 256 KB

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="my-3 rounded-lg border border-white/10 bg-black/40 overflow-hidden font-mono text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-white/[0.02] text-[10px] text-muted">
        <span className="uppercase tracking-wider">{language || "text"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="hover:text-foreground transition cursor-pointer"
        >
          {copied ? "[COPIED]" : "[COPY]"}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto leading-relaxed text-foreground/90 font-mono text-[11px]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Parses inline markdown: bold, italic, inline code, links, images, strikethrough.
 * Strips raw HTML tags to prevent XSS.
 */
function renderInline(
  text: string,
  owner: string,
  repoName: string,
  branch: string,
  docPath: string
): React.ReactNode[] {
  // Strip raw HTML tags
  const sanitized = text.replace(/<[^>]+>/g, "");
  const elements: React.ReactNode[] = [];
  let remaining = sanitized;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // 1. Image: ![alt](url)
    const imgMatch = remaining.match(/^!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      const alt = imgMatch[1];
      const rawUrl = imgMatch[2];
      const src = resolveMarkdownUrl(rawUrl, owner, repoName, branch, docPath, true);
      elements.push(
        <span key={`img-${keyIndex++}`} className="inline-block my-2 max-w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="max-w-full h-auto rounded border border-white/10 shadow-sm"
          />
        </span>
      );
      remaining = remaining.slice(imgMatch[0].length);
      continue;
    }

    // 2. Link: [text](url)
    const linkMatch = remaining.match(/^\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      const label = linkMatch[1];
      const rawUrl = linkMatch[2];
      const href = resolveMarkdownUrl(rawUrl, owner, repoName, branch, docPath, false);
      const isInternalAnchor = href.startsWith("#");
      elements.push(
        <a
          key={`link-${keyIndex++}`}
          href={href}
          target={isInternalAnchor ? undefined : "_blank"}
          rel={isInternalAnchor ? undefined : "noopener noreferrer"}
          className="text-accent underline underline-offset-2 hover:text-accent/80 transition"
        >
          {renderInline(label, owner, repoName, branch, docPath)}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // 3. Inline Code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      elements.push(
        <code
          key={`code-${keyIndex++}`}
          className="rounded bg-white/10 px-1 py-0.5 text-accent font-mono text-[10px] sm:text-[11px]"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // 4. Bold: **text** or __text__
    const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
    if (boldMatch) {
      elements.push(
        <strong key={`bold-${keyIndex++}`} className="font-semibold text-foreground">
          {renderInline(boldMatch[2], owner, repoName, branch, docPath)}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // 5. Italic: *text* or _text_
    const italicMatch = remaining.match(/^(\*|_)(.*?)\1/);
    if (italicMatch) {
      elements.push(
        <em key={`italic-${keyIndex++}`} className="italic text-foreground/90">
          {renderInline(italicMatch[2], owner, repoName, branch, docPath)}
        </em>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // 6. Strikethrough: ~~text~~
    const strikeMatch = remaining.match(/^~~(.*?)~~/);
    if (strikeMatch) {
      elements.push(
        <del key={`strike-${keyIndex++}`} className="line-through text-muted">
          {renderInline(strikeMatch[1], owner, repoName, branch, docPath)}
        </del>
      );
      remaining = remaining.slice(strikeMatch[0].length);
      continue;
    }

    // Regular plain text chunk up to next formatting token
    const nextSpecial = remaining.search(/(!\[|\[|`|\*\*|__|\*|_|~~)/);
    if (nextSpecial === -1) {
      elements.push(remaining);
      break;
    } else if (nextSpecial > 0) {
      elements.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    } else {
      // Just take the single character if no match succeeded
      elements.push(remaining[0]);
      remaining = remaining.slice(1);
    }
  }

  return elements;
}

export default function SafeMarkdown({
  content,
  repo,
  branch = "main",
  docPath = "README.md",
  className = "",
  htmlUrl,
}: SafeMarkdownProps) {
  if (!content) {
    return <p className="text-muted text-xs italic">No content available.</p>;
  }

  // Byte size guard for oversized files
  const byteLength = new TextEncoder().encode(content).length;
  if (byteLength > MAX_DOCUMENT_BYTES) {
    return (
      <div className="p-4 rounded-lg border border-warning/30 bg-warning/10 text-warning text-xs font-mono">
        <p className="font-semibold">Document exceeds display limit (256 KB).</p>
        <p className="mt-1 text-foreground/80">
          This document is {Math.round(byteLength / 1024)} KB. To preserve client performance, please
          view the raw file directly on GitHub.
        </p>
        {htmlUrl && (
          <a
            href={htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 px-3 py-1 rounded border border-warning/50 text-warning hover:bg-warning/20 transition"
          >
            Open on GitHub ↗
          </a>
        )}
      </div>
    );
  }

  const parts = repo.split("/");
  const owner = parts.length > 1 ? parts[0] : "SGOD-pro";
  const repoName = parts.length > 1 ? parts[1] : parts[0];

  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let blockKey = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 1. Code blocks: ```lang ... ```
    if (line.trim().startsWith("```")) {
      const language = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      const isMermaid = language.toLowerCase() === "mermaid";
      nodes.push(
        isMermaid ? (
          <MermaidBlock
            key={`mermaid-block-${blockKey++}`}
            code={codeLines.join("\n")}
          />
        ) : (
          <CodeBlock
            key={`code-block-${blockKey++}`}
            language={language}
            code={codeLines.join("\n")}
          />
        )
      );
      continue;
    }

    // 2. Headings (# H1 to ###### H6)
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2].trim();
      const id = slugify(headingText);
      const inline = renderInline(headingText, owner, repoName, branch, docPath);

      if (level === 1) {
        nodes.push(
          <h1
            key={`h-${blockKey++}`}
            id={id}
            className="text-base sm:text-lg font-bold font-mono tracking-tight text-foreground mt-4 mb-2 pb-1 border-b border-white/10"
          >
            {inline}
          </h1>
        );
      } else if (level === 2) {
        nodes.push(
          <h2
            key={`h-${blockKey++}`}
            id={id}
            className="text-sm sm:text-base font-bold font-mono tracking-tight text-accent mt-3.5 mb-1.5 pb-0.5 border-b border-white/5"
          >
            {inline}
          </h2>
        );
      } else if (level === 3) {
        nodes.push(
          <h3
            key={`h-${blockKey++}`}
            id={id}
            className="text-xs sm:text-sm font-semibold font-mono text-foreground mt-3 mb-1"
          >
            {inline}
          </h3>
        );
      } else {
        nodes.push(
          <h4
            key={`h-${blockKey++}`}
            id={id}
            className="text-[11px] sm:text-xs font-semibold font-mono text-muted mt-2.5 mb-1 uppercase tracking-wider"
          >
            {inline}
          </h4>
        );
      }
      i++;
      continue;
    }

    // 3. Horizontal Rule
    if (/^(\*\*\*|---|___)$/.test(line.trim())) {
      nodes.push(<hr key={`hr-${blockKey++}`} className="my-3 border-white/10" />);
      i++;
      continue;
    }

    // 4. Blockquote (> text)
    if (line.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      nodes.push(
        <blockquote
          key={`quote-${blockKey++}`}
          className="border-l-2 border-accent/80 bg-white/[0.02] pl-3 py-1.5 my-2.5 text-[11px] sm:text-xs text-muted font-mono italic leading-relaxed"
        >
          {renderInline(quoteLines.join(" "), owner, repoName, branch, docPath)}
        </blockquote>
      );
      continue;
    }

    // 5. Tables (| col1 | col2 |)
    if (line.includes("|") && lines[i + 1] && /^\s*\|?[-:\s|]+\|?\s*$/.test(lines[i + 1])) {
      const headerRow = line
        .split("|")
        .map((c) => c.trim())
        .filter((c, idx, arr) => !(idx === 0 && c === "") && !(idx === arr.length - 1 && c === ""));

      i += 2; // skip header and separator
      const bodyRows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        const row = lines[i]
          .split("|")
          .map((c) => c.trim())
          .filter(
            (c, idx, arr) => !(idx === 0 && c === "") && !(idx === arr.length - 1 && c === "")
          );
        bodyRows.push(row);
        i++;
      }

      nodes.push(
        <div
          key={`table-${blockKey++}`}
          className="my-3 overflow-x-auto rounded border border-white/10 bg-black/20"
        >
          <table className="w-full text-left font-mono text-[11px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.04]">
                {headerRow.map((h, hIdx) => (
                  <th key={hIdx} className="px-3 py-1.5 text-muted font-semibold uppercase text-[10px]">
                    {renderInline(h, owner, repoName, branch, docPath)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bodyRows.map((r, rIdx) => (
                <tr key={rIdx} className="hover:bg-white/[0.02]">
                  {r.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-1.5 text-foreground/90">
                      {renderInline(cell, owner, repoName, branch, docPath)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // 6. Lists: unordered (*, -) or ordered (1.)
    if (/^\s*([*+-]|\d+\.)\s+/.test(line)) {
      const isOrdered = /^\s*\d+\.\s+/.test(line);
      const listItems: string[] = [];
      while (i < lines.length && /^\s*([*+-]|\d+\.)\s+/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\s*([*+-]|\d+\.)\s+/, ""));
        i++;
      }
      if (isOrdered) {
        nodes.push(
          <ol
            key={`ol-${blockKey++}`}
            className="list-decimal pl-5 space-y-1 my-2 text-[11px] sm:text-xs text-foreground/90 font-mono leading-relaxed"
          >
            {listItems.map((item, idx) => (
              <li key={idx}>{renderInline(item, owner, repoName, branch, docPath)}</li>
            ))}
          </ol>
        );
      } else {
        nodes.push(
          <ul
            key={`ul-${blockKey++}`}
            className="list-disc pl-5 space-y-1 my-2 text-[11px] sm:text-xs text-foreground/90 font-mono leading-relaxed"
          >
            {listItems.map((item, idx) => (
              <li key={idx}>{renderInline(item, owner, repoName, branch, docPath)}</li>
            ))}
          </ul>
        );
      }
      continue;
    }

    // 7. Regular paragraph / empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].includes("|") &&
      !/^\s*([*+-]|\d+\.)\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }

    nodes.push(
      <p
        key={`p-${blockKey++}`}
        className="my-2 text-[11px] sm:text-xs text-muted font-mono leading-relaxed"
      >
        {renderInline(paraLines.join(" "), owner, repoName, branch, docPath)}
      </p>
    );
  }

  return (
    <article className={`space-y-1 text-[11px] font-mono leading-relaxed ${className}`}>
      {nodes}
    </article>
  );
}
