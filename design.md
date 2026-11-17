# Portfolio design: Theme 03 Dark

Status: updated implementation brief, not a claim that the theme has been applied or tested.

Repository inspected for glass integration: `cd9b0e41b67c7b797745588a21c130ca6e4fdb3c` on 2026-11-17. Reinspect the actual working tree before applying.

Apply after the existing phases and their acceptance checks are complete. This document changes the visual system. Existing data, routing, accessibility, glass rendering and performance requirements remain in force.

## 1. Direction and alternatives

Source: the supplied SWYRA gallery, numbered Theme 03, Off-White / Sage / Tomato Red / Evergreen. Palette page 8 and responsive light/dark page 10. Page numbers count from the first PDF page.

| Choice | Best reason to use it | Tradeoff |
| --- | --- | --- |
| 03 Dark, recommended | Connects the portfolio to the owner's brand. Evergreen surfaces, soft text and a restrained tomato action feel distinctive and professional. | Too much green fill or red decoration would make the terminal feel busy. |
| 14 Dark | Kombu Green / Brushed Aluminium / Signal Orange has an industrial engineering feel and fits the existing warm highlights. | Less connected to Theme 03's brand identity. |
| 05 Dark | Charcoal / Silver / Yellow gives the cleanest neutral terminal and strong content separation. | More generic; yellow can dominate small controls. |

Use Theme 03 Dark for this specification. These are alternatives, not three themes to implement. The gallery's sample restaurant copy and layouts are not portfolio content.

Visual target: a quiet, dark developer portfolio with clear project evidence, restrained WebGL glass and short, readable text. A recruiter or client should quickly understand the developer's role, work and contact action.

## 2. Scope and order

1. Read the actual `AGENTS.md`, `GEMINI.md`, phases file and current design instructions. Resolve actual names and casing from the repository.
2. Record HEAD, working-tree changes and baseline screenshots. Do not overwrite unrelated work.
3. Verify existing phases are complete from evidence. If prerequisites remain, report them and defer theme implementation. Do not mark them complete from a checklist alone.
4. Append a theme migration phase after the last existing phase. Do not renumber or rewrite completed phases.
5. Apply shared tokens, then shared components, then route details, then verify.

This explicitly replaces any old instruction requiring amber as the portfolio's brand accent for this theme pass. Preserve every unrelated rule. Do not combine Theme 03 with old amber and blue decorative accents.

Do not change API response shapes, GitHub fetching, caching, pinned-project selection, README/architecture discovery, contact delivery or route behavior as part of a color migration. Report a pre-existing issue separately with evidence.

## 3. Brand anchors

Preserve the source anchors as named brand values:

| Anchor | Hex | Role |
| --- | --- | --- |
| Off-white | `#F7F5EF` | Light canvas and soft light text on suitable dark surfaces |
| Sage | `#9CAF88` | Supporting highlight, small selected-state details |
| Tomato | `#E8412C` | Original brand reference, not automatically a text or button foreground |
| Evergreen | `#102D25` | Brand ink in light mode and a dark material reference |

Functional colors below are source-gallery variants or explicitly identified supporting additions. Keep brand anchors separate from functional UI roles.

## 4. Functional tokens

The canvas, card, well, featured, heading and primary action pairs below come from Theme 03's responsive gallery page. Secondary text, links, focus and subtle boundaries are supporting additions for this portfolio.

| Semantic role | Dark | Light |
| --- | --- | --- |
| Canvas | `#0D1915` | `#F7F5EF` |
| Card / surface | `#15271F` | `#FFFFFF` |
| Well / secondary surface | `#243E33` | `#EFF2EC` |
| Featured surface | `#264235` | `#48654C` |
| Heading / main foreground | `#F7F7F2` | `#111A17` |
| Secondary text | `#A9B8AF` | `#53635A` |
| Featured foreground | `#F7F7F2` | `#F7F5EF` |
| Primary action background | `#D63825` | `#D63825` |
| Primary action foreground | `#FFFFFF` | `#FFFFFF` |
| Primary hover background | `#C03826` | `#C03826` |
| Link text | `#9CAF88` | `#102D25` |
| Focus ring | `#9CAF88` | `#102D25` |
| Subtle separator | `rgba(247,247,242,0.10)` | `rgba(16,45,37,0.12)` |

Use the existing HeroUI and Tailwind token architecture. Inspect the installed integration before editing. Map these roles to existing `--background`, `--foreground`, `--surface`, `--surface-secondary`, `--overlay`, `--default`, `--segment`, `--field-*`, `--accent`, `--accent-foreground`, `--muted`, `--focus`, `--border`, `--separator` and their foreground companions. Resolve higher surfaces through the existing token system rather than leaving old amber values behind.

Map `--accent` to the primary action role. Use a separate semantic link or command role for sage text. Do not use the red action token for all links, headings, selected tabs or code. Existing `--command` should become the readable link role rather than retaining decorative blue.

Update the selectors actually consumed by the current theme provider. Keep classes and `data-theme` selectors consistent. Set `color-scheme` correctly for each mode. Dark is the default for a new visitor; preserve an existing explicit user choice. If a switch already exists, keep it working. Do not add a theme-management dependency just for this task.

### Contrast rules

Calculated for opaque solid pairs:

| Pair | Contrast |
| --- | --- |
| White on action `#D63825` | 4.72:1 |
| Evergreen `#102D25` on sage `#9CAF88` | 6.25:1 |
| Off-white `#F7F5EF` on featured green `#48654C` | 5.94:1 |
| Off-white `#F7F5EF` on sage `#9CAF88` | 2.16:1, fails normal text |

Therefore, use evergreen text on the original sage. Use the darker featured green when off-white text is needed. Never solve this by changing the original sage anchor.

Do not use `#D63825` as small standalone text on the dark canvas. It is a button background paired with white. Keep normal red error text on a separate accessible semantic token.

Normal text needs at least 4.5:1, large text at least 3:1. Essential control boundaries and focus indicators need 3:1 against adjacent colors. Subtle decorative separators are not substitutes for essential control boundaries. Validate actual translucent composites over both quiet and bright dot-grid states. These solid-pair calculations do not certify glass contrast.

## 5. Status, toast and data colors

These status anchors come from Theme 03's gallery page:

| Role | Dark anchor | Light anchor |
| --- | --- | --- |
| Success | `#66AA8C` | `#2E8A62` |
| Warning | `#CC9C55` | `#B97816` |
| Error | `#D96E80` | `#CB3851` |
| Information | `#6EA1CA` | `#397EB6` |

Use these for status icons, markers and measured foreground pairs. They are not pre-approved small text colors on every surface. Toast bodies use the regular foreground on a stable surface; include a readable status label and icon. Preserve live-region behavior. Keep action red visually separate from error status.

Existing charts may use the gallery's five series:

- Dark: `#F39E93`, `#F9FAF8`, `#ED6A59`, `#C2CAC8`, `#889692`.
- Light: `#D83C29`, `#131510`, `#889692`, `#45514C`, `#792217`.

Some series are similar. Where adjacent series are hard to distinguish, add direct labels or patterns and validate contrast instead of claiming color alone solves it. GitHub language colors may remain data-specific, with visible language names and percentages. Do not add charts or metrics just to display the palette.

## 6. Typography and spacing

The inspected `src/app/globals.css` already defines Geist and IBM Plex Mono. Keep those families and their existing font loading; verify the actual root layout before changing imports. Do not add another font family or fetch duplicate font files.

| Element | Specification |
| --- | --- |
| Primary name / heading | Geist, 600, `clamp(2rem, 4vw, 3.5rem)`, line height 1.1 |
| Route heading | Geist, 600, 24-32px, line height 1.2 |
| Card heading | Geist, 600, 18-20px, line height 1.3 |
| Body and descriptions | Geist, 400, 16px, line height 1.6 |
| Buttons and navigation | Geist, 500, 14px, line height 1.4 |
| Terminal prompt and metadata | IBM Plex Mono, 400/500, 12-14px, line height 1.5 |
| README prose | Geist, 16px, line height 1.7; code stays monospace |

Use a 4px spacing scale. Page inset: 16px mobile, 24px desktop. Card padding: 20px mobile, 24px desktop. Card grid gap: 16-24px. Heading-to-body gap: 12px. Section gap: 32px mobile, 40px desktop. Tags: 6px vertical and 10px horizontal padding, with 8px gaps.

Keep prose around 55-70 characters per line. Let document content wrap naturally. Code blocks and wide tables may scroll within their own containers. Do not reduce text size to fit desktop layouts on phones.

Preserve useful whitespace. Do not fill empty space with system logs, counters, quotes or decorative cards. Avoid tiny uppercase labels, excessive tracking, cramped chip rows and nested panels with repeated headings.

## 7. Glass, background and depth

- Keep the existing real WebGL liquid-glass renderer and configurable wrapper API. No SVG substitution.
- Preserve the working shared backdrop, canvas alignment, refresh, disposal and fallback behavior.
- Glass is static as a material. No pointer-follow, drag, wobble, jiggle, pulsing or autonomous deformation.
- Use the theme's dark green as a restrained material tint. The center should remain clear and quiet, with a subtle edge reflection. Do not turn the whole pane into a bright green block.
- Apply the same material preset to the main shell and sidebar. Do not invent new optical parameter values without checking the installed component's implementation and ranges.
- Keep text and controls as crisp DOM content above the optical layer.
- Treat opaque `--surface` colors as stable card, overlay and fallback roles. Do not blindly apply an opaque background that hides the WebGL effect on the glass shell.
- Keep the dot grid, but lower its visual prominence behind prose. Adjust existing visual configuration only; measure before blaming or rewriting its renderer.
- Use subtle elevation and tonal separation. Avoid hard outlines on every card. Retain focus rings and any boundaries essential to using controls.
- Use glass for the existing major panes. Ordinary cards need no extra canvas or blur renderer.
- Keep the separate 3D object and its existing interaction working. Recolor its existing material through established props where possible; avoid new geometry or effects.

Preserve context-loss and unsupported-WebGL fallbacks. Theme switching must not create duplicate contexts, animation loops or event listeners. Do not add another graphics or animation library.

### Required glass and theme integration

The replacement `GlassSurface.tsx` is a static WebGL 2 wrapper. It keeps the existing `backdrop`, `backdropRef`, `backdropFit`, refresh event and DOM children contract. It adds `bevelWidth`, measured in CSS pixels, to control the optical band independently of the outline stroke.

Use the same starting preset on both major panes:

| Prop | Value |
| --- | --- |
| `borderRadius` | `24` |
| `bevelWidth` | `32` |
| `refraction` | `0.85` |
| `thickness` | `20` |
| `bevel` | `0.5` |
| `distortion` | `0` |
| `reflection` | `0.8` |
| `shine` | `0.65` |
| `dispersion` | `0.02` |
| `frost` | `0` |
| `borderWidth` | `0.6` |
| `borderOpacity` | `0.09` |
| `tint` / `tintOpacity` | `#FFFFFF` / `0.01` |
| `maxDpr` | `1.25` |
| `live` | `false`, the existing DotGrid frame callback refreshes the glass |

These are starting values for this renderer, not universal physical measurements or a promise to reproduce a different backdrop pixel for pixel. A large pane stays mostly flat in the middle; its curved optical edge creates the liquid appearance. Do not increase frosting to simulate refraction.

The inspected home layout explicitly supplies its old optical values to both panes. Update both prop blocks; new component defaults cannot override explicit JSX props. Preserve each pane's own forwarded ref and shared backdrop references.

The inspected snapshot callback also caches the canvas background color only once. Before enabling theme switching, update that cached color from the resolved canvas token when the theme changes, repaint the opaque snapshot, and trigger a DotGrid redraw through its actual supported API. Then dispatch `glass-refresh` after the new frame has been copied. Do not guess a DotGrid imperative method or use a permanent polling loop. Verify first paint, dark-to-light and light-to-dark with the pointer stationary. Theme token changes must reach the WebGL texture, not just the DOM background.

Use a theme-derived neutral for DotGrid's base color and sage for its active color. Convert CSS variables to concrete colors before passing them if the current renderer requires parsed hex values. Keep full brightness out of the background. Do not rebuild the dot simulation or add a cloud photograph to the live portfolio just to make glass look stronger.

The opaque snapshot must include the page background and actual dot pixels. A transparent source shows an unrefracted copy of the underlying dots through the refracted layer. Do not fake capture of arbitrary DOM, repository text or the separate 3D canvas. Only the explicitly supplied image/video/canvas is sampled.

In DevTools verify `data-glass-renderer="webgl"` and `data-glass-refraction="texture"` on both panes. A fallback status or `none` means real textured refraction is not active. Diagnose that state before adjusting shadows. Inspect the `onEffectError` callback or the component's console warning for unavailable WebGL, shader or upload failures.

## 8. Route guidance and copy

| Area | Theme and content treatment |
| --- | --- |
| Home | Name, clear role, one short introduction, selected work and a contact action. Use actual GitHub data where already connected. |
| Skills | Keep useful categories and short skill labels. Remove unsupported proficiency bars, invented percentages and decorative system-load claims. |
| Projects | Quiet, readable project summaries. Preserve pinned-source behavior and project selection. Distinguish actual loading, empty, error and stale data states. |
| Project document | Comfortable README/architecture reading width; code and tables scroll locally. Active document has a clear selected state. Keep repository and optional live URL links working. |
| Sidebar | Real project metadata or useful contact links. Reduce repeated instructions and filler telemetry. |
| Experience | Use verified experience. If there is no professional employment, say so plainly and emphasize real projects without inventing dates, employers or results. |
| Achievements | Keep verifiable achievements and links. Avoid filler to equalize page height. |
| Contact | Plain field labels and a clear contact action. Preserve validation, submission, errors and success behavior. |
| Navigation | Consistent spacing, readable selected state and keyboard focus. Preserve terminal commands and standard clickable navigation. |

Use tomato for the page's main action, such as Contact me. Secondary actions use quiet surfaces. Use sage with a tonal background and `aria-current` or `aria-selected` for selection. Active navigation is not an error state.

Remove verified placeholder copy such as fake deployment logs, fake latency, unsupported encryption claims and invented status messages. Do not delete real GitHub data or replace it with polished-looking mock data. The gallery brand name and restaurant sample copy are not replacements for the owner's identity or portfolio copy.

## 9. Motion and resource budget

Preserve the transition solution accepted in prior phases. Do not reintroduce native view snapshots and GSAP entrances on the same content subtree. Theme work must not animate the entire glass renderer or persistent shell between routes.

Keep content entrances brief: opacity and about 6-10px translation, roughly 250-400ms, small stagger. No per-character animation on every paragraph. Never animate blur, shader thickness or large shadows during navigation.

Respect reduced motion. Content must be visible without JavaScript animation completing. Animate real counters only, preserve final accessible values and do not replay unchanged counts on every render.

No new continuous loops, extra full-screen canvases, per-card WebGL contexts or font families. Compare the same interactions before and after using a production build on the same device, viewport and browser. Development route timings are not frame-rate measurements.

## 10. Implementation and verification

Use the package manager, scripts and test tools actually present. Do not assume a command or a Playwright MCP method exists. Discover configured browser tools and report unavailable checks honestly.

| Step | Acceptance evidence |
| --- | --- |
| Baseline | Actual HEAD, relevant file inventory, existing phase status, representative screenshots and a production performance sample |
| Shared tokens | Dark and light values mapped through existing provider; old decorative amber/blue overrides removed from relevant components |
| Shared components | Buttons, tags, fields, tabs, navigation, command input, glass panes, overlays, toast and sidebar checked |
| Routes | Home, skills, projects, a real project document, experience, achievements and contact inspected |
| Accessibility | Keyboard navigation, visible focus, contrast over real glass, 200% zoom, readable errors and reduced-motion behavior |
| Regression | Existing GitHub requests, project switches, README/architecture tabs, optional live links, command navigation and contact behavior remain correct |
| Build | Existing lint, type checks and production build run where configured; failures classified accurately |
| Performance | Comparable before/after traces; no unexplained new contexts, repeated animation mounts or material resource regressions |

Playwright viewport checks: 360x800, 390x844, 768x1024 and 1440x900. Inspect loaded fonts and settled data before taking comparison screenshots. Verify that fixed navigation does not hide content, the sidebar stacks cleanly and the document page has no unintended horizontal page overflow.

Exercise Chromium, Firefox and WebKit where available. A Playwright engine result is evidence for that engine and environment, not a guarantee for every Chrome, Edge, Safari, iOS or Android device. Report browser/version, viewport, result and any untested target. Do not claim universal support.

Test dark as the initial default, persisted explicit choice and switching if a switch exists. Check for a light flash, hydration mismatch, native form color mismatch and changing canvas colors after a switch. Keep API tests and network checks proportionate to the presentation change.

Completion means the implementation has been rendered, visually inspected against this direction and exercised. A passing build alone is insufficient. Save evidence and any remaining limitation in the existing phase verification record. Never write fabricated pass results.


