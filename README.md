# Souvik Karmakar - Engineering Portfolio

A terminal-inspired portfolio for Souvik Karmakar ([@SGOD-pro](https://github.com/SGOD-pro)), Fullstack Developer and Applied AI Engineer.

Built with Next.js App Router, React 19, TypeScript, Tailwind CSS, and WebGL.

---

## Technical Architecture

### 1. Visual Identity & Compositing
- **Dark Terminal Theme**: Deep charcoal backgrounds with warm amber accents (`#b46004` / `oklch(57.57% ...)`).
- **Liquid Glass Shader** (`src/components/GlassSurface.tsx`): Custom WebGL fragment shader simulating refractive optical dispersion, bevels, and specular sheen over a calm, readable content surface.
- **Interactive Dot Background** (`src/components/DotBackground.tsx`): Physics-driven canvas particle grid with cached layout dimensions to eliminate forced synchronous reflows, bounded substeps, and automatic resting state.
- **3D Interactive Code Logo** (`src/components/3DCode.tsx`): React Three Fiber model with `frameloop="demand"`, smooth auto-rotation, pause-on-hover, and an instantaneous zero-bundle static SVG fallback (`src/components/StaticCodeFallback.tsx`) for reduced motion or headless environments.

### 2. GitHub Data Layer (`src/lib/github/`)
- **Server-Only Credentials**: Uses `GITHUB_TOKEN` exclusively on the server. No credentials or auth headers are ever exposed to client bundles or browser responses.
- **Authenticated Pinned Repositories**: Queries GitHub's GraphQL `user.pinnedItems` API to reflect live pinned projects.
- **Resilient Public Fallback**: When unauthenticated, falls back cleanly to verified public repositories via REST.
- **Cache & Concurrency Control**:
  - In-memory TTL caching (`MemoryCache`) with 1-hour validity.
  - Stale-while-revalidate semantics: on upstream outages or rate limits, usable cached data is returned with `isStale: true` while preserving original timestamps.
  - Concurrency limiter capping active requests to $\le 3$.
  - In-flight request deduplication preventing duplicate simultaneous requests.
- **Zero-Dependency Safe Markdown** (`src/components/SafeMarkdown.tsx`): Safe AST-based Markdown parser that sanitizes HTML, blocks dangerous URL schemes (`javascript:`, `data:`), and rewrites relative links/images against upstream GitHub repository refs.

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm 10+

### Environment Setup
Create a `.env` file in the root directory (refer to `.env.example`):
```bash
cp .env.example .env
```

Add your optional GitHub Personal Access Token to enable live pinned repository syncing:
```env
GITHUB_TOKEN=ghp_yourTokenHere
```
*(If omitted, the portfolio gracefully falls back to verified public repositories via the public REST API.)*

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the port reported by the CLI) to view the portfolio.

---

## Verification & Testing

The project maintains 100% passing automated acceptance tests covering the GitHub data layer, project documentation reader, and contact form validation:

```bash
# Run unit & acceptance test suites
npm test

# Run TypeScript type-checking
npx tsc --noEmit

# Run ESLint validation
npm run lint
```

Detailed phase verification logs, browser traces, and screenshot evidence are maintained in [`docs/verification.md`](docs/verification.md).

---

## License
MIT © Souvik Karmakar
