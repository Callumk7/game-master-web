# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Package Manager:** This project uses `pnpm` as the package manager.

**Development server:**
```bash
pnpm dev
# Runs on port 3000
```

**Build and test:**
```bash
pnpm build      # Build for production
pnpm test       # Run Vitest tests
pnpm serve      # Preview production build
```

**Code quality:**
```bash
pnpm lint       # Lint with Biome
pnpm format     # Format with Biome
pnpm check      # Combined lint and format check
```

**API code generation:**
```bash
pnpm codegen    # Generate API client from OpenAPI schema
```

## Project Architecture

This is a **TanStack Start** application - a full-stack React meta-framework with SSR capabilities.

### Core Technologies
- **React 19** with TypeScript
- **TanStack Router** - File-based routing with type safety
- **TanStack Query** - Server state management with SSR integration
- **TanStack Start** - Full-stack framework with SSR
- **Tailwind CSS 4** - Styling framework
- **React Aria Components** - Accessible UI components
- **Biome** - Linting and formatting

### Key Architectural Patterns

**API Integration:**
- Generated API client from OpenAPI schema at `src/api/`
- API client configured in `src/utils/api-client.ts` (base URL: http://localhost:4000)
- Authentication handled via Bearer tokens in API headers

**Routing Structure:**
- File-based routing in `src/routes/`
- Protected routes under `_auth/` layout
- Route tree auto-generated in `src/routeTree.gen.ts`
- Game management routes nested under `_auth/games/$id/`

**Authentication Flow:**
- Session management in `src/utils/session.ts`
- Auth components: `src/components/Auth.tsx`, `src/components/Login.tsx`
- Server-side session fetching in `__root.tsx`

**Game Master Features:**
The app appears to be a game master tool with resources for:
- Characters (`_auth/games/$id/characters/`)
- Factions (`_auth/games/$id/factions/`)
- Locations (`_auth/games/$id/locations/`)
- Notes (`_auth/games/$id/notes/`)
- Quests (`_auth/games/$id/quests/`)

### Important File Locations
- API client initialization: `src/utils/api-client.ts`
- Root layout and auth context: `src/routes/__root.tsx`
- Router configuration: `src/router.tsx`
- Session utilities: `src/utils/session.ts`
- OpenAPI configuration: `openapi-ts.config.ts`

### Development Notes
- Demo files (prefixed with `demo.`) can be safely deleted
- Route tree is auto-generated - do not edit `routeTree.gen.ts` directly
- API types are generated from `server/schema/swagger.json`
- The app uses dark mode by default (`className="dark"` in root layout)