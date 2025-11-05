# Game Master Web

A modern web application for managing tabletop RPG campaigns, built with TanStack Start and React 19.

## Overview

Game Master Web is a full-stack campaign management tool that helps game masters organize and track:

- **Characters** - Player and NPC management
- **Factions** - Organizations and groups
- **Locations** - World building and places
- **Notes** - Rich text documentation with Tiptap editor
- **Quests** - Campaign storylines and objectives

## Tech Stack

### Core Framework
- **React 19** - Latest React with TypeScript
- **TanStack Start** - Full-stack React framework with SSR
- **TanStack Router** - File-based routing with type safety
- **TanStack Query** - Server state management with SSR integration

### UI & Styling
- **Tailwind CSS 4** - Utility-first styling
- **Base-UI** - Headless accessible components
- **Tiptap** - Rich text editor for notes
- **React Flow** - Interactive visualizations
- **Lucide React** - Icon library
- **Motion** - Animations

### Data & State
- **TanStack Table** - Powerful data tables
- **TanStack Form** - Type-safe form management
- **Zustand** - Client state management
- **Zod** - Runtime validation

### Developer Experience
- **Biome** - Fast linting and formatting
- **Vitest** - Unit testing
- **TypeScript** - Type safety
- **OpenAPI Code Generation** - Type-safe API client

## Project Structure

```
src/
├── routes/              # File-based routing
│   ├── __root.tsx      # Root layout with auth
│   └── _auth/          # Protected routes
│       └── games/$id/  # Game-specific resources
│           ├── characters/
│           ├── factions/
│           ├── locations/
│           ├── notes/
│           └── quests/
├── api/                # Generated API client
├── components/         # Reusable UI components
│   └── ui/            # Base UI components
├── utils/             # Utilities and helpers
│   ├── api-client.ts  # API configuration
│   └── session.ts     # Auth session management
└── router.tsx         # Router configuration
```

## Getting Started

**Prerequisites:** This project uses `pnpm` as the package manager.

```bash
# Install dependencies
pnpm install

# Start development server (runs on port 3000)
pnpm dev

# Generate API client from OpenAPI schema
pnpm codegen
```

## Building For Production

```bash
pnpm build      # Build for production
pnpm serve      # Preview production build
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing:

```bash
pnpm test       # Run tests
```

## Code Quality

This project uses [Biome](https://biomejs.dev/) for linting and formatting:

```bash
pnpm lint       # Lint code
pnpm format     # Format code
pnpm check      # Combined lint and format check
```

## Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing. Routes are managed as files in `src/routes`

- Routes are automatically generated from files in `src/routes/`
- Route tree is auto-generated in `src/routeTree.gen.ts` (do not edit directly)
- Protected routes are nested under `_auth/` layout
- Game-specific resources are under `_auth/games/$id/`

## API Integration

The project uses an auto-generated API client from OpenAPI schema:

- API client configured in `src/utils/api-client.ts`
- Backend API runs on `http://localhost:4000`
- Authentication via Bearer tokens
- Regenerate client with `pnpm codegen` after schema changes

## Authentication

- Session management in `src/utils/session.ts`
- Auth components in `src/components/Auth.tsx` and `src/components/Login.tsx`
- Server-side session handling in `__root.tsx`

## Learn More

- [TanStack Start Documentation](https://tanstack.com/start)
- [TanStack Router Documentation](https://tanstack.com/router)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Tiptap Editor Documentation](https://tiptap.dev)
