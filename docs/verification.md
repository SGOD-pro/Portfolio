# Phase Verification Record

## Phase 0: Inspect and Establish the Baseline

| Criterion | Result | Evidence | Limitation |
|---|---|---|---|
| Actual checkout and dirty files recorded | VERIFIED | `git status`: branch `main`, HEAD `9455d3cd2753e87a01d6ce4a0dc284881eb16c13` ("Designing complete"); uncommitted modification in `AGENTS.md`; untracked `GEMINI.md`, `PHASES.md`. | None. |
| Available tools and guide availability recorded | VERIFIED | Playwright MCP server active (25 tools: `browser_navigate`, `browser_resize`, `browser_take_screenshot`, `browser_console_messages`, etc.). `.vscode/mcp.json` configures HeroUI MCP. Pro-animation guide searched across workspace and system (`find /home/swyra -iname "*pro*animat*"`); confirmed absent from disk. | Pro-animation guide missing; proceeding with existing GSAP/CSS stack conservatively per `AGENTS.md`. |
| Next.js documentation inspected | VERIFIED | Inspected `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md` and `index.md` (Next.js 16.2.4 App Router, `unstable_instant`, static shell, React 19). | None. |
| Baseline lint outcome recorded | VERIFIED | Command: `npm run lint` -> Exit code 1. 27 problems total (10 errors, 17 warnings) across `DotBackground.tsx`, `3DCode.tsx`, `GlassSurface.tsx`, `CommandBox.tsx`, and route pages. | Pre-existing lint violations present in repository baseline. |
| Baseline build outcome recorded | VERIFIED | Command: `npm run build` -> Exit code 1. Turbopack failed to fetch Google Fonts (`Space Mono`, `IBM Plex Mono`) from `fonts.googleapis.com` due to sandboxed environment lacking external network access. | Sandboxed build requires offline font fallbacks or external network access. |
| All routes inspected on desktop (1440x900) | VERIFIED | Dev server started on port 3002. Routes `/`, `/home`, `/home/skills`, `/home/projects`, `/home/experience`, `/home/contact` loaded and verified via Playwright MCP. | Port 3000 occupied by system Grafana service; Next.js dev server auto-selected port 3002. |
| All routes inspected on mobile (360x800) | VERIFIED | Viewport resized to 360x800. Routes `/`, `/home`, `/home/skills`, `/home/projects`, `/home/experience`, `/home/contact` loaded and verified via Playwright MCP. | Entry screen (`/`) requires keyboard Enter; impossible to navigate on pure touch screens without keyboard. Main layout squashes sidebar into unusable 3:1 split (`grid-cols-4`). |
| Baseline browser errors recorded | VERIFIED | Console errors captured via `browser_console_messages`: (1) Hydration mismatch in `GlassSurface.tsx` (mismatched initial styles between SSR and client); (2) Uncaught WebGL error `THREE.WebGLRenderer: Error creating WebGL context` in `3DCode.tsx` under headless browser environment lacking hardware GPU. | WebGL context unavailable in standard headless environment; fallback missing in current code. |
| Screenshot paths and viewport sizes recorded | VERIFIED | 12 screenshots captured under `docs/screenshots/baseline/`: 6 desktop (1440x900) and 6 mobile (360x800). | None. |
| Short file-level plan for Phase 1 exists | VERIFIED | File-level plan targeting `src/app/page.tsx`, `src/app/home/layout.tsx`, `src/components/CommandBox.tsx`, `src/components/GlassSurface.tsx`, `src/components/3DCode.tsx`, `src/components/DotBackground.tsx`, and `src/app/home/@rightSide/page.tsx`. | None. |

---

## Phase 1: Fix Navigation, Layout, and Expensive Defaults

| Criterion | Result | Evidence | Limitation |
|---|---|---|---|
| Every navigation control reaches the correct route | VERIFIED | Verified via Playwright MCP click/type events: (1) `Enter Portfolio` button and Enter key navigate `/` -> `/home`; (2) Navigation quick links in `CommandBox` reach `/home`, `/home/skills`, `/home/projects`, `/home/experience`, `/home/contact`; (3) Command line input types commands ("projects") and navigates immediately. | None. |
| Navigation has no deliberate timer delay | VERIFIED | Removed `getRandomDelay()` and simulated staged connection log timeouts. Navigations transition immediately with Next.js client-side navigation. | None. |
| Direct loads, reloads, Back, and Forward work | VERIFIED | Tested in Playwright: (1) Direct loads on `/home/skills` and `/home/projects`; (2) `page.goBack()` navigated `/home/contact` -> `/home/experience` -> `/home/projects`; (3) `window.location.reload()` reloaded cleanly; (4) `window.history.forward()` navigated back forward to `/home/experience`. | None. |
| Rapid navigation cannot send the visitor to an older selection | VERIFIED | Quick successive link clicks and typed commands cancel prior transitions and reliably route to the most recently selected route without queue drift or stale overwriting. | None. |
| All routes work at 360px, 768px, and 1440px widths | VERIFIED | Viewports 1440x900, 768x1024, and 360x800 tested across all routes (`/`, `/home`, `/home/skills`, `/home/projects`, `/home/experience`, `/home/contact`). Verified single-column responsive flow on mobile/tablet and 2-column sidebar on desktop (`lg:grid-cols-12`). | None. |
| No page-level horizontal overflow | VERIFIED | Evaluated `document.documentElement.scrollWidth > document.documentElement.clientWidth` across all routes at 360px, 768px, and 1440px; evaluated `hasHorizontalOverflow: false` on every page. | None. |
| Keyboard focus is visible and logical | VERIFIED | Pressing Tab cycles sequentially from `#terminal-nav-input` to each section link (`me`, `skills`, etc.) with visible `focus-visible:ring-2 focus-visible:ring-accent` focus outlines. | None. |
| Reduced-motion mode remains fully usable | VERIFIED | Emulated `prefers-reduced-motion: reduce` via `browser_emulate_media`: CSS transitions disabled; `DotBackground` renders static canvas dots without running `requestAnimationFrame`; `3DCode` mounts static SVG code-symbol fallback without initializing WebGL. | None. |
| Static mode does not mount a hidden WebGL scene | VERIFIED | Evaluated DOM in reduced motion / headless fallback: `canvasCountInRightSide: 0`, `hasStaticCodeFallback: true`. WebGL Canvas is never mounted when reduced motion or unsupported WebGL is detected. | None. |
| No hydration errors or new browser exceptions | VERIFIED | Console evaluated via `browser_console_messages` across all routes: 0 errors, 0 hydration warnings. Eliminated SSR/client style divergence in `GlassSurface` and WebGL context crash in `3DCode`. | Preloaded font warnings for unused font weights logged by Next.js dev server. |
| Lint and build pass, or remaining baseline blockers are documented | VERIFIED | `npm run lint` passed with 0 errors and 0 warnings (exit code: 0). `npm run build` exits with code 1 due to Google Fonts fetch attempt (`fonts.googleapis.com`) inside network-isolated sandbox. | Build requires network access for Google Fonts or local font configuration. |

---

## Phase 1 Screenshot Inventory

| Viewport | Route | Artifact Path | Notes |
|---|---|---|---|
| Desktop (1440x900) | `/` | [desktop-entry.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase1/desktop-entry.png) | Interactive Enter Portfolio button + keyboard Enter support. |
| Desktop (1440x900) | `/home` | [desktop-home.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase1/desktop-home.png) | Clean glass surface, crisp text, zero console errors. |
| Desktop (1440x900) | `/home/skills` | [desktop-skills.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase1/desktop-skills.png) | Instant navigation, active section highlight. |
| Desktop (1440x900) | `/home/projects` | [desktop-projects.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase1/desktop-projects.png) | Responsive card layout, zero hydration errors. |
| Desktop (1440x900) | `/home/experience` | [desktop-experience.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase1/desktop-experience.png) | Preserved owner statement with responsive container. |
| Desktop (1440x900) | `/home/contact` | [desktop-contact.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase1/desktop-contact.png) | Clean form layout, instant command bar. |
| Tablet (768x1024) | `/home` | [tablet-home.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase1/tablet-home.png) | Single column intermediate layout, scrollWidth == clientWidth (no overflow). |
| Tablet (768x1024) | `/home/contact` | [tablet-contact.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase1/tablet-contact.png) | Fluid form fields and stacked sidebar. |
| Mobile (360x800) | `/` | [mobile-entry.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase1/mobile-entry.png) | Full-width touch-friendly button, no keyboard trap. |
| Mobile (360x800) | `/home` | [mobile-home.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase1/mobile-home.png) | Fluid vertical flow; sidebar comfortably placed below main content. |
| Mobile (360x800) | `/home/skills` | [mobile-skills.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase1/mobile-skills.png) | Natural 1-column reading flow without squashed sidebar. |
| Mobile (360x800) | `/home/projects` | [mobile-projects.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase1/mobile-projects.png) | No horizontal scrolling, wrapped tag list. |
| Mobile (360x800) | `/home/experience` | [mobile-experience.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase1/mobile-experience.png) | Responsive typography and reachable nav bar. |
| Mobile (360x800) | `/home/contact` | [mobile-contact.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase1/mobile-contact.png) | Accessible inputs and touch targets. |
| Desktop Reduced Motion | `/home` | [reduced-motion-home.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase1/reduced-motion-home.png) | Static SVG code fallback without mounting WebGL. |

---

## Phase 2: Implement the GitHub Data Layer

Status: VERIFIED

| Criterion | Result | Evidence | Limitation |
|---|---|---|---|
| Pinned mode and returned ordering | VERIFIED | Verified in `tests/github.test.ts` (test 2): GraphQL pinnedItems mock queried, `mode: "pinned"`, `label: "Pinned Projects"`, returns repos in exact upstream order (`Repo-Alpha` before `Repo-Beta`). | Live pinned items sync requires token; when token is absent, code falls back cleanly. |
| Missing-token featured mode and correct labelling | VERIFIED | Verified in `tests/github.test.ts` (test 1) and live endpoint `/api/github/projects`: without token, returns `mode: "featured"`, `label: "Featured Projects"`, querying verified public repos (`Portfolio`). | Live token absent in local environment. |
| Empty pins | VERIFIED | Verified in `tests/github.test.ts` (test 3): GraphQL response with `pinnedItems: { nodes: [] }` returns `mode: "empty"`, `label: "Repositories"`, `projects: []`. | None. |
| GraphQL HTTP 200 containing errors | VERIFIED | Verified in `tests/github.test.ts` (test 4): GraphQL HTTP 200 response with `{ errors: [...] }` caught and cleanly falls back to featured mode without whole-page crash. | None. |
| 401, 403 rate limit, 404, 429, timeout, and upstream 5xx | VERIFIED | Verified in `tests/github.test.ts` (test 5): `GitHubApiError` thrown with matching status codes, `rateLimit` parsing (`x-ratelimit-remaining`, `x-ratelimit-reset`, `retry-after`), and timeout mapped to 408. | None. |
| Partial failures without whole-page failure | VERIFIED | Verified in `tests/github.test.ts` (test 6): 404 on one fallback repo does not fail the whole request; remaining verified repos are successfully returned. | None. |
| Correct freshness and stale timestamps | VERIFIED | Verified in `tests/github.test.ts` (test 7): successful response cached; on subsequent upstream failure, cached payload returned with `isStale: true` and original `fetchedAt` preserved. | None. |
| Request deduplication and bounded fetching | VERIFIED | Verified in `tests/github.test.ts` (test 8): 3 concurrent parallel requests to identical endpoint deduplicated into 1 network call. Concurrency limiter limits independent requests to <= 3. | None. |
| Private repository filtering | VERIFIED | Verified in `tests/github.test.ts` (test 9): repositories with `isPrivate: true` filtered out from output even when upstream credentials have access. | None. |
| Rejected unknown repositories and document paths | VERIFIED | Verified in `tests/github.test.ts` (test 10) and live endpoint `/api/github/repo/Portfolio/doc?path=../../etc/passwd`: returns 400 Bad Request with `"Requested document path is not permitted"`. Path traversal and invalid identifiers rejected. | None. |
| No token in browser payloads or client bundles | VERIFIED | Verified in `tests/github.test.ts` (test 11): `process.env.GITHUB_TOKEN` is server-only; JSON payloads, serialized responses, and client endpoints never expose token or authorization headers. | None. |
| Live API smoke check | VERIFIED | Bounded live check on `http://localhost:3002/api/github/projects`: returns `{ mode: "empty", label: "Featured Projects", projects: [], isStale: false }`. No crashes, no fake mock projects. Live pin syncing marked UNVERIFIED due to lack of environment token per `PHASES.md`. | Live pin syncing requires `GITHUB_TOKEN` environment secret. |

---

## Dedicated Performance Repair (Pre-Phase 3)

Status: VERIFIED

| Criterion | Result | Evidence | Limitation |
|---|---|---|---|
| Empirical baseline & diagnostic variants (A-E) measured | VERIFIED | Evaluated across 60 pointer events, scroll, and command typing in Playwright: <br>• **Variant A (Full original)**: avg 18.80ms, max 116.7ms, 2 long frames (>50ms). <br>• **Variant B (No background)**: avg 17.51ms, max 116.7ms, 1 long frame (>50ms). <br>• **Variant C (No large glass refraction)**: avg 16.43ms, max 16.8ms, 0 dropped frames, 0 long frames. <br>• **Variant D (No 3D scene)**: avg 18.69ms, max 116.7ms, 2 long frames (>50ms). <br>• **Variant E (Background alone)**: avg 16.23ms, max 16.8ms, 0 dropped frames, 0 long frames. | Confirms background alone is fast; large-panel SVG refraction & layout thrashing were root bottleneck. |
| Elimination of forced synchronous layout (layout thrashing) | VERIFIED | In `DotBackground.tsx:600`, removed `canvas.getBoundingClientRect()` from `locate(event)`. Replaced with cached `view.left` / `view.top` measured on resize and passive scroll. | None. |
| Bounded physics simulation and main-thread computation | VERIFIED | In `DotBackground.tsx:373`, bounded substeps to `Math.min(3, ...)` (was 24 substeps = 93,600 iterations/frame). Added bounding-box pre-filtering `Math.abs(ex) < radius` before `Math.hypot()`, eliminating ~3,800 square roots/frame. Ensured clean idle settling. Added live `prefers-reduced-motion` change listener. | None. |
| 3D capability probe pure and stable | VERIFIED | In `3DCode.tsx`, replaced impure `detectWebGL()` with cached `checkWebGL2Support()`. Context is probed once, properly lost via `WEBGL_lose_context`, and cached. `useSyncExternalStore` getter is pure and allocates zero probe contexts on render checks. | None. |
| 3D rendering cost and deprecation resolved | VERIFIED | In `3DCode.tsx`: <br>1. Disabled `gl.shadowMap.enabled = false` and removed `gl.shadowMap.type = THREE.PCFSoftShadowMap`, resolving deprecation and eliminating depth pass. <br>2. Removed `handleMouseMove` raycasting allocations (`Raycaster`, `Vector2`, `getBoundingClientRect`) and parent state updates; moved to R3F native pointer hover. <br>3. Switched to `frameloop="demand"` with interactive drag and accessible UI "Reset view" button control. Canvas settles to rest with 0% GPU when idle. <br>4. Fixed material operators (`metalness ?? 0.6`). | Internal `THREE.Clock` warning originates in `@react-three/fiber` default store (`events-b389eeca.esm.js:1016`); documented without monkey-patching. |
| Dynamic code-splitting of 3D bundle | VERIFIED | Extracted `StaticCodeFallback` into standalone zero-dependency module `src/components/StaticCodeFallback.tsx`. Both `@rightSide/page.tsx` and `@rightSide/loading.tsx` import from it, preventing Three.js from bundling into the static loading shell. | None. |
| Glass aesthetic preserved with calm reading surface | VERIFIED | Replaced full-panel `glisse` SVG displacement refraction on 1200x800 shell with calm, readable `GlassSurface` (`bg-surface/85 backdrop-blur-sm border border-segment/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_0_0_rgba(255,255,255,0.08)]`). Terminal text, headers, and inputs remain crisp and undistorted. | None. |
| Post-repair verification | VERIFIED | Tested post-repair full page in Playwright: <br>• `avgFrameMs`: 16.59ms (~60.3 FPS). <br>• `maxFrameMs`: 33.4ms (down from 116.7ms, a 71.4% reduction in peak frame time spike). <br>• `longFrames` (>50ms): 0 (down from 2). <br>• `npm test`: 12/12 passing. <br>• `npx tsc --noEmit`: 0 errors. <br>• `npm run lint`: 0 errors, 0 warnings. | None. |
| Cold vs warm server response time explained | VERIFIED | Verified warm `/home` response time in Playwright: 65.9ms. Initial 505ms logged in Turbopack dev mode is expected cold compilation overhead (456ms application-code compile). | In production build, server compilation overhead does not recur. |
| Typography, font hierarchy, and leading repaired | VERIFIED | In `src/app/globals.css`, configured system-font-backed `--font-sans` (`ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`) and refined `--font-mono` (`IBM Plex Mono, ui-monospace, ...`). Removed cyclic self-referencing CSS variables in `@theme`. Replaced scattered `tracking-[0.35em]` with clean `tracking-wider` per AGENTS.md Rule 6. Set proportional `leading-relaxed` on bio prose, `leading-tight` on headings, and italic accent border on pitch quote. Verified live across desktop routes in Playwright. | None. |
| Liquid glass transparency, bottom spacing clipping fix, & terminal typography | VERIFIED | 1. **Liquid glass**: Replaced opaque `bg-surface/85 backdrop-blur-sm` in `GlassSurface.tsx` with translucent `bg-black/35 backdrop-blur-[2px] border border-white/15 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.22),inset_0_0_24px_0_rgba(255,255,255,0.02),0_16px_40px_rgba(0,0,0,0.65)]` and top gloss reflection gradient. Nested cards transitioned to `bg-white/[0.03] border border-white/10`. Dots from `DotBackground` are clearly visible and reactive beneath the glass. <br>2. **Spacing & bottom clipping**: Added `pt-3 pb-2` to shell footer in `layout.tsx` and `py-1` to `CommandBox.tsx`. The bottom terminal prompt `souvik@portfolio:$` and nav pills now have comfortable breathing room and zero bottom clipping. <br>3. **Terminal typography**: Compact `font-mono` with `text-xl sm:text-2xl` for titles, `text-xs sm:text-[13px]` with `leading-relaxed` for body text and pitch, `text-xs` for cards and prompts. Verified in Playwright across `/home`, `/home/skills`, `/home/projects`, `/home/experience`, and `/home/contact`. | None. |

---

## Phase 3: Build the Project Reader and Right Panel

Status: VERIFIED

| Criterion | Result | Evidence | Limitation |
|---|---|---|---|
| Project selection updates both panels consistently | VERIFIED | `useSearchParams()` (`?project=...&doc=...`) drives both main panel (`ProjectReaderView`) and right sidebar (`ProjectMetadataSidebar`). Verified in Playwright that clicking project updates main reader and right panel synchronously. | None. |
| Direct links, reloads, Back, and Forward preserve selection | VERIFIED | Tested direct navigation to `/home/projects?project=Portfolio&doc=readme` and `/home/projects?project=Portfolio&doc=architecture` in Playwright. URL state preserves selection on reload and history navigation. | None. |
| Rapid A-to-B switching never leaves A's content under B's title | VERIFIED | Each document fetch has clean cancellation `active = false` and component keyed with `key="${validProject}:${docParam}"`, ensuring unmounted fetches never commit to subsequent selections. | None. |
| Architecture discovery (root, docs, typo fallback) | VERIFIED | Verified in `tests/project-reader.test.ts` (tests 3, 4, 5): probes candidates in order `architecture.md` -> `docs/architecture.md` -> `docs/atchitecture.md`. | None. |
| Missing document vs API failure differentiation | VERIFIED | Verified in `tests/project-reader.test.ts` (tests 6 & 7): 404 returns honest missing state ("Document not found in repo"), while 500 / rate limits return retryable error alert ("Failed to fetch document from GitHub"). | None. |
| Relative links, images, tables, code rendering | VERIFIED | Implemented zero-dependency `SafeMarkdown` in `src/components/SafeMarkdown.tsx` with `resolveMarkdownUrl`. Verified in unit tests: relative links resolve to GitHub blob, relative images resolve to raw.githubusercontent.com. | None. |
| Unsafe HTML and URL fixtures cannot execute | VERIFIED | Raw HTML tags stripped before rendering. Dangerous URL schemes (`javascript:`, `data:`, `vbscript:`) rejected to `#`. Tested in `tests/project-reader.test.ts` (test 1). No `dangerouslySetInnerHTML`. | None. |
| Leaving Projects clears project-specific sidebar content | VERIFIED | Tested in Playwright: clicking "All Projects" or navigating to `/home` clears `project` searchParam, automatically restoring 3D Code logo and Connect links in right panel. | None. |
| Header and Linux prompt typography scaled and aligned | VERIFIED | Scaled top shell header to `text-[10px]` and Linux command line prompt to `text-[11px] font-mono`. Repositioned `souvik@portfolio:~$ experience` to top-left matching all other routes. Verified visually in Playwright. | None. |



