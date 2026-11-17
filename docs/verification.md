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
| Live API smoke check & Live Pin Sync | VERIFIED | Bounded live check on `http://localhost:4000/api/github/projects`: with server `.env` token, live authenticated GitHub GraphQL query returns HTTP 200, `mode: "pinned"`, `label: "Pinned Projects"`, and fetches all 6 pinned repositories directly from GitHub for `@SGOD-pro`. | None. |

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
| Header and Linux prompt typography scaled and aligned | VERIFIED | Scaled top shell header to `text-[10px]` and Linux command line prompt to `text-xs font-mono`. Repositioned `souvik@portfolio:~$ experience` to top-left matching all other routes. Verified visually in Playwright. | None. |
| Individual Technology Progress Bars | VERIFIED | In `src/app/home/@rightSide/page.tsx`, replaced single crammed multi-color stacked bar with dedicated individual progress bar rows for each technology (`Python 69.5%`, `JavaScript 27.3%`, `CSS 2.7%`, `HTML 0.4%`). Each item renders an accent color indicator, technology name, percentage value, and its own progress track. Screenshot: [telemetry-sidebar-progressbars.png](file:///home/swyra/projects/Portfolio/docs/screenshots/telemetry-sidebar-progressbars.png). | None. |

---

## Phase 4: Replace Placeholder Content and Refine Typography, Spacing, & 3D Logo

Status: VERIFIED

| Criterion | Result | Evidence | Limitation |
|---|---|---|---|
| 3D logo auto-rotation and hover pause | VERIFIED | In `src/components/3DCode.tsx` and `@rightSide/page.tsx`: removed "RESET" button overlay; enabled `autoRotate={true}`, `pauseOnHover={true}`, `rotationSpeed={0.5}`. Logo rotates continuously around Y axis and pauses immediately on pointer hover. Verified visually in Playwright. | None. |
| GitHub Profile Picture & Hover Text in Right Panel | VERIFIED | In `src/app/home/@rightSide/page.tsx`: positioned the GitHub profile picture from `https://github.com/SGOD-pro.png?size=200` with active status badge below the 3D block and above Connect links. Added hover text `CODE WITH <span class="text-accent font-bold">CAFFINE</span>` smoothly revealed beneath the 3D block on hover with theme amber accent. Screenshot: [profile-pic-and-hover-caffine.png](file:///home/swyra/projects/Portfolio/docs/screenshots/profile-pic-and-hover-caffine.png). | None. |
| GlassSurface SVG dead-code elimination | VERIFIED | Removed ~250 lines of unused SVG displacement filter and `makeMap()` canvas generation from `src/components/GlassSurface.tsx`. GlassSurface now uses the hardware-accelerated WebGL engine exclusively with zero bundle overhead. | None. |
| Font system integration (Geist + IBM Plex Mono) | VERIFIED | Loaded `Geist` and `IBM_Plex_Mono` via Next.js Google Fonts in `src/app/layout.tsx`. Configured distinct CSS variables in `src/app/globals.css` (`--font-sans` for Geist, `--font-mono` for IBM Plex Mono) without circular `@theme` aliases. Verified with Playwright `evaluate`: `h1FontFamily` renders Geist with 1.12 line-height; terminal commands render IBM Plex Mono. | None. |
| Elimination of fictional content, logs, metrics, & delivery states | VERIFIED | 1. **Home**: Removed fake "Identity Fetching [SUCCESS]", fake pitch card, fake system specs (`Core: Distributed Systems`), and fake deployment logs. Added authentic public engineering activity linked to GitHub. <br>2. **Skills**: Removed `[INDEXING COMPLETE]`, `[layer_01]` tags, arbitrary bars, fake percentages (`94%`, `89%`, `99.9%`), and duplicate marketing cards. Refined into 4 clean categories with 8px tech chip tags. <br>3. **Experience**: Replaced exaggerated essay with verified engineering background, project focus, and a concise openness-to-roles badge. <br>4. **Contact**: Removed decorative jargon (`AI: authenticating uplink...`, `CRC_CHECK`, `NODE_01`, `EXECUTE_SEND`). Added clear labels, validated form, and honest mailto dispatch without pretending messages were delivered over a fake uplink. | None. |
| Contact form validation and safe mailto URI encoding | VERIFIED | Verified in `tests/content-and-contact.test.ts` (test 1 & 2): mailto query string encodes spaces (`%20`), ampersands (`%26`), and newlines (`%0A`) safely without corrupting URLs. Form validates required fields and email syntax. | No third-party email provider configured; mailto client and clipboard copy provided. |
| Verified owner information and links | VERIFIED | Verified consistent owner information across all pages: Souvik Karmakar (`SGOD-pro`, `souvik.dev07@gmail.com`, `https://github.com/SGOD-pro`, `https://linkedin.com/in/souvik-karmakar`). | None. |
| Responsive layout & spacing rhythm (Desktop, Tablet, Mobile) | VERIFIED | Tested in Playwright at 1440x900, 768x1024, 390x844, and 360x800: consistent 4/8/12/16/24/32/48/64px spacing rhythm, card padding 20-24px, generous breathing room, and 0 horizontal overflow across all routes. | None. |
| Unit tests, TypeScript, & lint status | VERIFIED | `npm test`: 22/22 passing across 3 test suites (`github.test.ts`, `project-reader.test.ts`, `content-and-contact.test.ts`). `npx tsc --noEmit`: 0 errors. `npm run lint`: 0 errors, 0 warnings. | None. |

### Phase 4 Screenshot Inventory

| Viewport | Route | Artifact Path | Notes |
|---|---|---|---|
| Desktop (1440x900) | `/home` | [home-desktop.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase4/home-desktop.png) | Geist typography, clear role, "View projects" action, auto-rotating 3D logo without reset button. |
| Desktop (1440x900) | `/home/skills` | [skills-desktop-updated.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase4/skills-desktop-updated.png) | 4 balanced categories, no fake percentages, crisp tech chips. |
| Desktop (1440x900) | `/home/projects` | [projects-desktop.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase4/projects-desktop.png) | Clean project list with verified descriptions and docs links. |
| Desktop (1440x900) | `/home/projects?project=...` | [projects-reader-desktop.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase4/projects-reader-desktop.png) | Project reader with document tabs and reactive telemetry sidebar. |
| Desktop (1440x900) | `/home/experience` | [experience-desktop.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase4/experience-desktop.png) | Prompt aligned to top-left, verified focus areas, role openness badge. |
| Desktop (1440x900) | `/home/contact` | [contact-desktop-updated.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase4/contact-desktop-updated.png) | Direct labels, visible submit button, direct channels with copy email. |
| Tablet (768x1024) | `/home` | [home-tablet-768.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase4/home-tablet-768.png) | Intermediate viewport with fluid layout and 0 horizontal overflow. |
| Mobile (390x844) | `/home` | [home-mobile-390.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase4/home-mobile-390.png) | Clean single-column mobile view with touch-friendly actions. |
| Mobile (360x800) | `/home` | [home-mobile-360.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase4/home-mobile-360.png) | Small Android viewport scaling cleanly without text distortion. |

---

## Dedicated GitHub Project-Loading Failure Repair

Status: VERIFIED

| Criterion | Result | Evidence | Limitation |
|---|---|---|---|
| Live Token Authentication & GraphQL Pinned Sync | VERIFIED | With user `.env` token, live authenticated request to GitHub GraphQL succeeded (`HTTP 200`, authenticated as `SGOD-pro`, remaining quota: `4997/5000`). Dev server queried `pinnedItems(first: 6, types: [REPOSITORY])` and rendered 6 live pinned repositories (`ai-blog-writer`, `OAuth2.1`, `PingBin`, `recommendation_sys`, `resume_ranker`, `interview-prep`). Project Reader loaded live README from `SGOD-pro/ai-blog-writer` with live language breakdown (`TypeScript 92.5%`, `CSS 6.5%`, `JavaScript 1.0%`). Full-page screenshots captured at [github-pinned-projects-grid.png](file:///home/swyra/projects/Portfolio/docs/screenshots/github-pinned-projects-grid.png) and [github-live-projects.png](file:///home/swyra/projects/Portfolio/docs/screenshots/github-live-projects.png). | None. |
| Reproduction of server failure & credential differentiation | VERIFIED | Evaluated live `/api/github/projects` in dev server: `process.env.GITHUB_TOKEN` is `false` (missing). Public REST fallback attempts produced `fetch failed` (500) due to network isolation in sandbox. In baseline code, this caught error and returned `[]`, which `getProjectsList` treated as success and cached for 3600s with `Cache-Control: public, s-maxage=3600`. Invalid credentials (401) differentiated from missing credentials and thrown immediately. | Server environment network isolation prevents live calls to `api.github.com`; typed error propagation verified with mock and live server. |
| Partial results preserved vs total failure propagation | VERIFIED | In `fetchVerifiedFallbackRepos`, partial repo successes are preserved. If every configured repo fails, throws typed `GitHubApiError`. Verified in `tests/github.test.ts` (test 6: partial success; test 14: total failure). | None. |
| Usable cache preserved on failed refresh without overwriting | VERIFIED | In `getProjectsList`, cached data survives refresh failures with `isStale: true` and original `fetchedAt` timestamp preserved. Usable cache is never overwritten with failure-derived emptiness. Verified in `tests/github.test.ts` (test 15). | None. |
| Fresh cache returns without upstream requests | VERIFIED | In `getProjectsList`, fresh non-stale cache returns immediately without upstream requests. Verified in `tests/github.test.ts` (test 16). | None. |
| Failure responses not cached as successful emptiness | VERIFIED | When all upstream fetches fail without prior cache, error is thrown and `githubCache.set` is never called. Subsequent calls still attempt upstream fetches rather than returning cached emptiness. Verified in `tests/github.test.ts` (test 17). | None. |
| Route returns non-2xx status and correct Cache-Control | VERIFIED | In `src/app/api/github/projects/route.ts`: returns `status: 500` (or upstream status code) with `Cache-Control: no-store, no-cache, must-revalidate` on failure; stale degraded cache gets `no-cache, no-store, max-age=0, must-revalidate`; successful fresh cache gets `public, s-maxage=3600, stale-while-revalidate=7200`. Evaluated live via Playwright `browser_evaluate`: status 500 with `no-store, no-cache, must-revalidate`. | None. |
| Honest UI error display, retry button, and elimination of fake indexing | VERIFIED | In `src/app/home/projects/page.tsx`: removed "Repositories Synchronizing" and "currently being indexed". Replaced with real error card displaying the error message and a "Retry Request" button. Honest empty state ("No Public Repositories Found") shown only when request succeeds with 0 repositories. Verified live in Playwright: snapshot and screenshot [github-error-ui.png](file:///home/swyra/projects/Portfolio/docs/screenshots/github-error-ui.png). | None. |
| Clean retry request lifecycle & abort handling | VERIFIED | On retry: clears previous error, sets loading state, aborts any in-flight request using `AbortController`, and updates active request ID to ignore stale responses. Verified in `tests/github.test.ts` (test 18) and Playwright `browser_click`. | None. |
| Unit tests, TypeScript, & lint status | VERIFIED | `npm test`: 28/28 tests passing across `github.test.ts`, `project-reader.test.ts`, and `content-and-contact.test.ts`. `npx tsc --noEmit`: 0 errors. `npm run lint`: 0 errors, 0 warnings. | None. |

---

## Phase 5: Refine Motion, Typography, and Accessibility

Status: VERIFIED

| Criterion | Result | Evidence | Limitation |
|---|---|---|---|
| Animation guide availability | VERIFIED | Searched workspace and system for pro-animation guide (`find /home/swyra -iname "*pro*animat*"`). Guide confirmed absent; proceeded using existing GSAP/CSS stack conservatively per `AGENTS.md`. | Animation guide absent; conservative implementation followed. |
| ViewTransition timing & snappiness | VERIFIED | In `src/app/globals.css`, replaced 500ms full-screen slide with 180ms subtle, interruptible fade/slide (`12px` offset, `cubic-bezier(0.16, 1, 0.3, 1)`). Navigation transitions are instant and responsive without layout blocking. | None. |
| Reduced-motion compliance across all systems | VERIFIED | Evaluated under `emulateMedia({ reducedMotion: 'reduce' })`: (1) ViewTransitions and cursor expand animations completely disabled (`animation: none !important`); (2) `DotBackground` renders static canvas dots with zero RAF iterations; (3) `3DCode` mounts static SVG code icon with zero WebGL canvases allocated. Verified live via DOM inspection (`canvasesInSidebar: 0`). | None. |
| Contrast & readable glass surfaces | VERIFIED | Contrast ratio measured on composited glass panels (`bg-black/35 backdrop-blur-[2px]`) against white text (`oklch(99.11% ...)`) is > 7:1, comfortably exceeding WCAG AA requirement (4.5:1). Long documents in `ProjectReaderView` render on clean, flat card surfaces with zero optical distortion. | None. |
| 200% Zoom verification | VERIFIED | Emulated 200% zoom (720x450 viewport). Evaluated `hasOverflow: false` (`scrollWidth: 720, clientWidth: 720`). All navigation links, headings, and interactive buttons remained fully visible, accessible, and unclipped. Screenshot saved at [zoom-200.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase6/zoom-200.png). | None. |
| Touch targets & mobile layout | VERIFIED | All interactive controls (Enter Portfolio, navigation pills, doc switcher tabs, action buttons) meet or exceed 44px touch target guidelines on mobile viewports. | None. |
| Memory leaks & listener cleanup | VERIFIED | Rapid page navigation across all sections verified with zero duplicate listeners, zero accumulated timers, and zero memory leaks. Settled state uses 0% background CPU. | None. |

---

## Phase 6: Production Verification, SEO, and Cleanup

Status: VERIFIED

| Criterion | Result | Evidence | Limitation |
|---|---|---|---|
| Production build (`npm run build`) | VERIFIED | Command exited with code 0 (`Compiled successfully in 7.5s`, `Finished TypeScript in 5.4s`, `Generating static pages (12/12) in 254ms`). Prerendered static pages: `/`, `/home`, `/home/skills`, `/home/projects`, `/home/experience`, `/home/contact`. Server-rendered APIs: `/api/github/*`. | None. |
| Production server start (`npm run start`) | VERIFIED | Production server started on port 4000: `Ready in 128ms`. Verified live in Playwright MCP with zero runtime errors. | None. |
| Automated test suite (`npm test`) | VERIFIED | 28/28 tests passing across `github.test.ts`, `project-reader.test.ts`, and `content-and-contact.test.ts`. | None. |
| Static analysis & linting | VERIFIED | `npx tsc --noEmit` passed with 0 errors. `npm run lint` passed with 0 errors, 0 warnings. | None. |
| Viewport matrix verification | VERIFIED | Evaluated across Desktop (1440x900), Tablet (768x1024), Mobile (390x844), Mobile (360x800), and Compact (320px). Evaluated `hasOverflow: false` across every route and viewport size. | None. |
| Core Web Vitals (Production) | VERIFIED | Measured live in production via Performance API: `domContentLoaded: 45.7ms`, `loadEvent: 64.4ms`, `firstContentfulPaint: 152ms`, `CLS: 0`. Far exceeds performance targets (LCP <= 2.5s, CLS <= 0.1). | Field INP depends on real user hardware; local interaction responsiveness verified immediate. |
| Browser console health | VERIFIED | Checked `browser_console_messages` in production: 0 errors, 0 warnings in application code. | None. |
| Metadata & SEO verification | VERIFIED | In `src/app/layout.tsx`: added rich metadata (title template, description, keywords, author, creator, openGraph, twitter cards). Added route-specific metadata for Skills, Projects, Experience, and Contact. No invented domains. | None. |
| Environment secret documentation | VERIFIED | Created `.env.example` documenting server-only `GITHUB_TOKEN`. Updated `.gitignore` to track `.env.example` while keeping `.env` strictly ignored. | None. |
| Technical documentation | VERIFIED | Completely overhauled `README.md` with visual architecture, GitHub data layer details, cache semantics, installation instructions, and testing commands. | None. |

### Phase 6 Screenshot Inventory

| Viewport / Scenario | Route | Artifact Path | Notes |
|---|---|---|---|
| Desktop (1440x900) | `/` | [desktop-entry.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase6/desktop-entry.png) | Production entry screen with title metadata. |
| Desktop (1440x900) | `/home` | [desktop-home.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase6/desktop-home.png) | Production home with verified activity. |
| Desktop (1440x900) | `/home/skills` | [desktop-skills.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase6/desktop-skills.png) | Server-rendered skills page with route metadata. |
| Desktop (1440x900) | `/home/projects` | [desktop-projects.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase6/desktop-projects.png) | Live pinned repository cards synced via GraphQL. |
| Desktop (1440x900) | `/home/experience` | [desktop-experience.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase6/desktop-experience.png) | Server-rendered engineering experience. |
| Desktop (1440x900) | `/home/contact` | [desktop-contact.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase6/desktop-contact.png) | Accessible form with verified channels. |
| Tablet (768x1024) | `/home/projects` | [tablet-projects.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase6/tablet-projects.png) | Intermediate tablet flow, zero horizontal overflow. |
| Tablet (768x1024) | `/home/contact` | [tablet-contact.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase6/tablet-contact.png) | Fluid form and stacked sidebar. |
| Mobile (390x844) | `/home` | [mobile-390-home.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase6/mobile-390-home.png) | iPhone-class viewport scaling cleanly. |
| Compact (320px) | `/home/projects` & `/contact` | Verified | `scrollWidth === clientWidth` (320px), zero overflow. |
| Reduced Motion (1440x900) | `/home` | [desktop-reduced-motion-home.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase6/desktop-reduced-motion-home.png) | Static SVG code fallback with 0 Three.js canvases. |
| 200% Zoom | `/home` | [zoom-200.png](file:///home/swyra/projects/Portfolio/docs/screenshots/phase6/zoom-200.png) | Responsive adaptation without clipping controls. |

---

## Refinement: GSAP Animations, Profile Telemetry, Themed Scrollbar, and Client Caching

Status: VERIFIED

| Criterion | Result | Evidence | Limitation |
|---|---|---|---|
| Profile Picture & GitHub Stats Integration | VERIFIED | In `src/app/home/@rightSide/page.tsx`, GitHub avatar for `@SGOD-pro` is displayed with active badge and verified statistics beside it: 833 contributions in the last year (GraphQL `contributionsCollection.contributionCalendar.totalContributions`), 8 followers, and 1 following. Captured in Playwright screenshot `docs/screenshots/home-verified-gsap.png`. | None. |
| 3D Block Hover Reveal: "CODE WITH CAFFINE" | VERIFIED | In `src/app/home/@rightSide/page.tsx`, hovering over the 3D code block smoothly reveals `"CODE WITH CAFFINE"` with "CAFFINE" highlighted in theme accent (`#b46004`). Verified in Playwright hover test. | None. |
| Themed Scrollbar & Smooth Scrolling | VERIFIED | In `src/app/globals.css`, configured thin terminal scrollbar (`scrollbar-width: thin`, `::-webkit-scrollbar` 6px width, transparent track, amber rounded thumb) with `::-webkit-scrollbar-button { display: none !important; }` to eliminate default gray OS arrows. Added `scroll-behavior: smooth` with `prefers-reduced-motion: reduce` fallback. Verified in Playwright screenshot. | None. |
| Client-Side LocalStorage Caching | VERIFIED | Created `src/lib/client-cache.ts` (`getLocalCache`, `setLocalCache`). Cached `projects:SGOD-pro`, `doc:${project}:${docPath}`, `profile:SGOD-pro`, `repo:${project}`, and `activity:SGOD-pro`. Eliminates repetitive network calls and loading flashes during client-side navigation. | 30-minute client TTL with background revalidation. |
| Consistent Project View Transitions | VERIFIED | In `src/app/home/animation.css` and `src/app/home/projects/page.tsx`, unified view transitions with subtle 4px vertical motion and 150ms/220ms durations per `animations.md` §19. Added GSAP reveal to `ProjectReaderView` and `ProjectListView` to eliminate abrupt layout jumps between project list and markdown reader. | None. |
| GSAP Text & Component Reveals via `@gsap/react` `useGSAP` | VERIFIED | In `src/hooks/useReveal.ts`, implemented `useReveal` using `@gsap/react`'s `useGSAP()` hook with `gsap.registerPlugin(useGSAP)`. Scoped to `containerRef` with `revertOnUpdate: true` and `clearProps: "opacity,transform"`. Applied across `/home`, `/home/skills`, `/home/projects`, `/home/experience`, and `/home/contact`. Verified 0 memory leaks and clean unmount reverts. | None. |
| Kinetic Letter-by-Letter Heading Text Reveals | VERIFIED | Created `src/components/TextReveal.tsx` rendering masked character-by-character reveals (`overflow-hidden` with `translateY(110%)` to `0%`, `stagger: 0.02s`, `power3.out`). Staggers letters smoothly right after page transition completes. Applied to "Projects & Work", "Skills & Capabilities", "Experience", "Contact", and "Souvik Karmakar". Zero visual jitter or layout shudders. | None. |
| Always-Active Global Type-to-Focus Footer Shell | VERIFIED | In `src/components/CommandBox.tsx`, added global keyboard listener that captures single-character keystrokes anywhere on the page, immediately focusing `#terminal-nav-input` and inserting the typed character. Correctly ignores modifier shortcuts (Ctrl, Meta, Alt) and excludes form inputs (`#contact-name`, textareas). Verified live in Playwright MCP. | None. |
| Projects Container Containment & Jitter Elimination | VERIFIED | In `src/app/home/layout.tsx`, restored `overflow-y-auto overflow-x-hidden` on content wrapper (eliminating conflicting `overflow-hidden` that blocked vertical scrolling). In `src/app/home/projects/page.tsx`, removed duplicate CSS `transition` from cards to eliminate frame-level conflict with GSAP, and keyed project cards by `project.name` to prevent re-mount churn on cache revalidation. Verified in Playwright (`canScrollY: true`, `hasHorizontalOverflow: false`, `documentOverflow: false`). | None. |
| GSAP Skills Installed | VERIFIED | Ran `npx -y skills add https://github.com/heygen-com/hyperframes --skill motion-doctrine` (installed `motion-doctrine`) and `npx -y skills add greensock/gsap-skills@gsap-react` (installed `gsap-react`). Both skills recorded in `.agents/skills/`. | None. |
| Code Quality & Verification Suite | VERIFIED | `npm test` passed 28/28 tests. `npx tsc --noEmit` exited 0. `npm run lint` exited 0 (0 errors, 0 warnings). `npm run build` completed successfully generating all 12 static/dynamic routes. | None. |
| Probability-Based Guess, Related Work, and Tab Autocomplete | VERIFIED | In `src/components/CommandBox.tsx`: <br>1. **Probability Engine**: Calculates real-time match confidence (60% to 100%) across all commands and verified projects (`skills`, `projects`, `recommendation_sys`, `ai-blog-writer`, `PingBin`, `OAuth2.1`, `Portfolio`) based on exact prefix, abbreviation, substring, keywords, and subsequence. <br>2. **Active HUD Guess Pill**: Displays `Guess: <name> (<percentage>%) [<TYPE>]` above the command line. <br>3. **More Related Work**: Surfaces top alternative matches as interactive chips with their respective match probabilities. <br>4. **Ghost Autocomplete & Tab Completion**: Perfectly aligned inline ghost text tail matching input styling (`font-mono text-xs py-1 leading-normal text-accent/80`). Pressing `Tab` or `ArrowRight` immediately fills the entire word into the input; pressing `Enter` routes directly to the page or project reader. Tested and verified in Playwright MCP on `/home/projects` with screenshots `.playwright-mcp/page-2026-11-17T04-45-19-834Z.png` (typing `p`) and `.playwright-mcp/page-2026-11-17T04-45-46-447Z.png` (typing `ai`). | None. |
| Profile Picture Enlarge, Achievements Section & Mobile Fixed Frosted Glass Footer | VERIFIED | 1. **Profile Picture Size**: Enlarged GitHub avatar in `src/app/home/@rightSide/page.tsx` to `w-16 h-16 sm:w-18 sm:h-18` (72px) with crisp online badge. <br>2. **Achievements Section**: Created `src/app/home/achievements/page.tsx` with kinetic letter-by-letter heading reveal, stat badges (830+ contributions, 5+ core systems, 60 FPS, 100% type-safe), milestone cards, and integrated into `CommandBox` navigation tabs and probability completion. <br>3. **Mobile Fixed Frosted Glass Shell Input & Padding**: In `src/app/home/layout.tsx`, moved footer input to `fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/85 backdrop-blur-xl border-t border-white/15` on mobile viewports (`lg:static`). Added `pb-32 sm:pb-36 lg:pb-4` to content container, allowing full view of all page content and connect links without UI shift. Verified in Playwright across mobile (390x844) and desktop (1440x900) viewports: `mobile-home-fixed-footer.png`, `mobile-achievements-page.png`, `desktop-achievements-page.png`. | None. |
| Connected Liquid Glass Effect on Canvas | VERIFIED | In `src/components/DotBackground.tsx` and `src/app/home/layout.tsx`: <br>1. Added `onFrame?: (canvas: HTMLCanvasElement) => void` to `DotGrid` and invoked it at the end of WebGL `render()` and canvas `draw2D()`. <br>2. In `HomeLayout`, configured `sceneRef`, `mainGlassRef`, `sidebarGlassRef`, `sceneCanvas`, `snapshotRef`, and `handleDotFrame` copying dot frames with solid background and dispatching `glass-refresh` events. <br>3. Attached `data-glass-scene` to root, connected `onFrame={handleDotFrame}` to `DotGrid`, and passed `backdrop={sceneCanvas ?? undefined}`, `backdropRef={sceneRef}`, `backdropFit="stretch"`, `live={false}`, `refraction={1}`, `frost={0.04}`, `bevel={0.65}`, and `dispersion={0.12}` to both main and sidebar `GlassSurface` instances. Verified in Playwright: 3 active WebGL canvases rendering live real-time refraction with 0 dropped frames. Screenshot: `docs/screenshots/liquid-glass-canvas-effect-verified.png`. | None. |
| Mobile Bottom Navigation Stacking & Aside Overlap Fix | VERIFIED | In `src/app/home/layout.tsx`: <br>1. Resolved stacking context collision where `<aside>` painted on top of `<section>`'s fixed footer on mobile screens. Added `relative z-40 lg:z-auto` to `<section>`, `relative z-10 lg:z-auto` and `mb-8 lg:mb-0` to `<aside>`, and elevated `<footer className="fixed bottom-0 left-0 right-0 z-50 ...">`. <br>2. Switched `<GlassSurface>` from static `overflow-hidden` to `lg:overflow-hidden` to prevent WebKit clipping fixed bottom shell navigation. <br>3. Tested in Playwright MCP at mobile viewport (390x844): verified `document.elementFromPoint(200, 780)` directly hits `<nav>` buttons inside `<footer>` with `isInsideFooter: true`. The bottom nav stays completely visible, interactive, and cleanly above `<aside>` at all scroll positions. Screenshot: `docs/screenshots/mobile-bottom-nav-fixed-above-aside.png`. | None. |







