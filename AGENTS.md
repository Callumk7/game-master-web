# AGENTS.md — Game Master Web

This file is the shared source of truth for all AI agents working in this repository.
It covers project context, architecture, conventions, and tooling.

---

## Project Overview

**Game Master Web** is a tabletop RPG game-master companion app. It lets game masters manage
their campaigns — characters, factions, locations, notes, quests, and more — with an AI chat
assistant that can read and modify game entities on the user's behalf.

- **Frontend**: TanStack Start (full-stack React meta-framework with SSR)
- **Backend API**: Separate Go service (not in this repo), OpenAPI-specified
- **Deployment**: Cloudflare Workers (`gamemaster.callumkloos.dev`)
- **Backend hosting**: Railway (`gamemastercore-production.up.railway.app`)

---

## Development Commands

**Package manager:** `pnpm`

| Command          | Purpose                                   |
| ---------------- | ----------------------------------------- |
| `pnpm dev`       | Dev server on port 3000                   |
| `pnpm build`     | Production build                          |
| `pnpm serve`     | Preview production build                  |
| `pnpm test`      | Run Vitest tests                          |
| `pnpm typecheck` | TypeScript type checking (`tsc --noEmit`) |
| `pnpm lint`      | Lint with Biome                           |
| `pnpm format`    | Format with Biome                         |
| `pnpm check`     | Combined Biome lint + format check        |
| `pnpm codegen`   | Generate API client from OpenAPI schema   |
| `pnpm deploy`    | Build + deploy to Cloudflare Workers      |

> **⚠️ Never run the dev server yourself.** Inform the user when manual testing is required and
> tell them what to verify.

---

## Core Technologies

| Layer              | Technology                                     |
| ------------------ | ---------------------------------------------- |
| UI framework       | **React 19** with TypeScript                   |
| Meta-framework     | **TanStack Start** (SSR, server functions)     |
| Routing            | **TanStack Router** — file-based, type-safe    |
| Server state       | **TanStack Query** with SSR integration        |
| Forms              | **TanStack Form**                              |
| Tables             | **TanStack Table**                             |
| Styling            | **Tailwind CSS 4**                             |
| UI primitives      | **Base UI** (headless, accessible components)  |
| Rich text editor   | **TipTap** (ProseMirror-based)                 |
| AI chat            | **Vercel AI SDK** + **Google Gemini 2.5 Pro**  |
| Command palette    | **cmdk**                                       |
| Animations         | **Motion** (formerly Framer Motion)            |
| Layout             | **react-resizable-panels**, **vaul** (drawers) |
| Node graphs        | **@xyflow/react** (React Flow)                 |
| Icons              | **Lucide React**                               |
| Toasts             | **Sonner**                                     |
| Theme              | **next-themes** (dark mode default)            |
| Linting/formatting | **Biome**                                      |
| Deployment         | **Cloudflare Workers** via Wrangler            |

---

## Project Architecture

### Directory Structure

```
src/
├── ai/                    # AI chat system prompt & tool definitions
├── api/                   # Auto-generated API client (DO NOT EDIT)
│   ├── @tanstack/         # Generated TanStack Query hooks
│   ├── client.gen.ts      # Generated HTTP client
│   ├── sdk.gen.ts         # Generated SDK functions
│   ├── types.gen.ts       # Generated TypeScript types
│   └── zod.gen.ts         # Generated Zod schemas
├── components/
│   ├── ui/                # Reusable UI primitives (button, dialog, etc.)
│   ├── chat/              # AI chat components
│   ├── characters/        # Character CRUD components
│   ├── factions/          # Faction CRUD components
│   ├── locations/         # Location CRUD components
│   ├── notes/             # Note CRUD components
│   ├── quests/            # Quest CRUD components
│   ├── games/             # Game management components
│   ├── layout/            # Sidebar, window manager, tray
│   ├── dashboard/         # Dashboard views
│   ├── images/            # Image handling
│   ├── links/             # Entity linking
│   ├── todos/             # Todo drawer
│   └── ...                # Shared components (commander, auth, etc.)
├── hooks/                 # Custom React hooks
├── routes/
│   ├── __root.tsx         # Root layout, session fetching, providers
│   ├── _auth.tsx          # Auth layout guard (redirects to /login)
│   ├── _auth/
│   │   ├── games/
│   │   │   ├── index.tsx  # Games list
│   │   │   ├── new.tsx    # Create game
│   │   │   └── $gameId/   # Game detail routes
│   │   │       ├── route.tsx       # Game layout (sidebar, data loading)
│   │   │       ├── index.tsx       # Game dashboard
│   │   │       ├── edit.tsx        # Edit game
│   │   │       ├── settings.tsx    # Game settings
│   │   │       ├── chat.tsx        # AI chat (dev-only feature flag)
│   │   │       ├── all.tsx         # All entities view
│   │   │       ├── search.tsx      # Search
│   │   │       ├── images.tsx      # Image gallery
│   │   │       ├── initiative.tsx  # Initiative tracker
│   │   │       ├── objectives.tsx  # Objectives
│   │   │       ├── split.tsx       # Split view
│   │   │       ├── tree.tsx        # Tree view
│   │   │       ├── characters/     # Character CRUD routes
│   │   │       ├── factions/       # Faction CRUD routes
│   │   │       ├── locations/      # Location CRUD routes
│   │   │       ├── notes/          # Note CRUD routes
│   │   │       └── quests/         # Quest CRUD routes
│   │   └── account.tsx
│   ├── api/
│   │   ├── chat/$gameId.ts         # AI chat streaming endpoint (server)
│   │   └── entity-updates/         # Entity update server functions
│   ├── login.tsx
│   ├── signup.tsx
│   ├── logout.tsx
│   └── ...
├── types/                 # Shared TypeScript types
├── utils/                 # Utility functions
│   ├── api-client.ts      # API client init & auth helpers
│   ├── session.ts         # Server-side session management
│   ├── features.ts        # Feature flags
│   ├── cn.ts              # className merge utility
│   └── ...
├── styles.css             # Global styles (Tailwind)
└── router.tsx             # Router configuration
server/
└── schema/
    └── swagger.json       # OpenAPI spec (source for codegen)
```

### Key Architectural Patterns

**API Integration:**

- Generated API client from OpenAPI schema (`server/schema/swagger.json`)
- Config: `openapi-ts.config.ts` → outputs to `src/api/`
- Client configured in `src/utils/api-client.ts` (local base URL: `http://localhost:4000`)
- Authentication via Bearer tokens in API headers
- Generated TanStack Query hooks in `src/api/@tanstack/`

**Routing:**

- File-based routing in `src/routes/`
- Route tree auto-generated in `src/routeTree.gen.ts` — **never edit directly**
- Protected routes under `_auth/` layout (redirects unauthenticated users to `/login`)
- Game entity routes nested under `_auth/games/$gameId/`
- Each entity type (characters, factions, etc.) follows `index.tsx` / `new.tsx` / `$id/` pattern

**Authentication:**

- Server-side session via cookie (`src/utils/session.ts`)
- Session fetched in `__root.tsx` via `createServerFn`
- Auth guard in `_auth.tsx` layout — redirects to `/login` if no token
- Token propagated to API client via `updateApiAuth()`

**AI Chat System:**

- Server-side streaming endpoint at `/api/chat/$gameId`
- Uses Vercel AI SDK with Google Gemini 2.5 Pro
- System prompt and tools defined in `src/ai/`
- Chat currently behind feature flag — **dev-only** (`isChatEnabled = !import.meta.env.PROD`)
- Client-side chat state managed via `useGameChatController` hook

**Game Layout:**

- `$gameId/route.tsx` is the game shell — sidebar, command palette, entity windows
- Prefetches game data, location tree, quest tree, pinned entities on load
- Entity CRUD uses sheet (create) and dialog (edit) patterns
- Command palette (`cmdk`) for quick navigation and actions

---

## Programming Guidelines

### Must-Follow Rules

1. **Always use components from `/src/components/ui`** where a suitable primitive exists
2. **We use Base UI, NOT Radix.** Do not use `asChild` — use the `render` prop instead
3. **NEVER use `as any`** — ensure correct types at all times. This is non-negotiable.
4. **Always import React as a namespace:**
   ```tsx
   import * as React from "react";
   // Then: React.useState(), React.useEffect(), etc.
   ```
5. **Single responsibility** — keep components focused; extract complex logic into its own folder
6. **Complex components get their own folder** — co-locate sub-components, hooks, types, and utils
7. **Don't edit generated files** — `src/api/`, `src/routeTree.gen.ts` are auto-generated
8. **Dark mode is the default** — test UI in dark mode first

### Code Style

- Biome handles linting and formatting — run `pnpm check` before committing
- TypeScript strict mode — no implicit any, no unused variables
- Prefer `type` over `interface` for object shapes (project convention)

---

## Feature Flags

Feature flags are defined in `src/utils/features.ts`:

| Flag            | Current value           | Notes                       |
| --------------- | ----------------------- | --------------------------- |
| `isChatEnabled` | `!import.meta.env.PROD` | AI chat is dev-only for now |

---

<!-- BACKLOG.MD GUIDELINES START -->

## Task Management — Backlog.md CLI

### Overview

This project uses **Backlog.md** for task management via CLI. All task operations **must** go
through the `backlog` CLI — never edit task files directly.

- Tasks live in `backlog/tasks/` as `task-<id> - <title>.md`
- Drafts live in `backlog/drafts/`
- Docs in `backlog/docs/`, decisions in `backlog/decisions/`
- **Always use `--plain`** flag for AI-friendly output

### ⚠️ CRITICAL: Never Edit Task Files Directly

- ✅ **DO**: `backlog task edit`, `backlog task create`, etc.
- ❌ **DON'T**: Edit markdown files, change checkboxes, or modify frontmatter manually

**Why?** Direct edits break metadata sync, Git tracking, and task relationships.

### Task Lifecycle

```bash
# 1. Find work
backlog task list -s "To Do" --plain

# 2. Read task details
backlog task 42 --plain

# 3. Start work — assign yourself & set status
backlog task edit 42 -s "In Progress" -a @myself

# 4. Add implementation plan (the "how")
backlog task edit 42 --plan $'1. Analyze\n2. Implement\n3. Test'

# 5. Implement — follow acceptance criteria, mark each done
backlog task edit 42 --check-ac 1 --check-ac 2 --check-ac 3

# 6. Add implementation notes (serves as PR description)
backlog task edit 42 --notes "Refactored using strategy pattern, updated tests"

# 7. Mark done
backlog task edit 42 -s Done
```

### Phase Discipline

| Phase              | What goes in the task                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------ |
| **Creation**       | Title, Description (the "why"), Acceptance Criteria (the "what"), labels/priority/assignee |
| **Implementation** | Implementation Plan (the "how") — added after moving to In Progress                        |
| **Wrap-up**        | Implementation Notes (like a PR description), all ACs checked, DoD verified                |

### Creating Tasks

```bash
backlog task create "Title" -d "Description" --ac "Criterion 1" --ac "Criterion 2"
```

**Good acceptance criteria are:**

- Outcome-oriented (not implementation steps)
- Testable / verifiable
- Clear, concise, user-focused

### Editing Tasks — Quick Reference

| Action              | Command                                                                     |
| ------------------- | --------------------------------------------------------------------------- |
| Change title        | `backlog task edit 42 -t "New Title"`                                       |
| Change status       | `backlog task edit 42 -s "In Progress"`                                     |
| Assign              | `backlog task edit 42 -a @sara`                                             |
| Add labels          | `backlog task edit 42 -l backend,api`                                       |
| Set priority        | `backlog task edit 42 --priority high`                                      |
| Edit description    | `backlog task edit 42 -d "New description"`                                 |
| Add AC              | `backlog task edit 42 --ac "New criterion"`                                 |
| Check AC            | `backlog task edit 42 --check-ac 1 --check-ac 2`                            |
| Uncheck AC          | `backlog task edit 42 --uncheck-ac 1`                                       |
| Remove AC           | `backlog task edit 42 --remove-ac 2`                                        |
| Add plan            | `backlog task edit 42 --plan "1. Step one"`                                 |
| Add notes (replace) | `backlog task edit 42 --notes "Details"`                                    |
| Append notes        | `backlog task edit 42 --append-notes "Update"`                              |
| Add dependency      | `backlog task edit 42 --dep task-1`                                         |
| Mixed operations    | `backlog task edit 42 --check-ac 1 --uncheck-ac 2 --remove-ac 3 --ac "New"` |

> **Multi-line input:** Use `$'line1\nline2'` (Bash/Zsh ANSI-C quoting). Normal quotes pass
> literal `\n` characters — they won't become newlines.

### Viewing Tasks

| Action             | Command                                      |
| ------------------ | -------------------------------------------- |
| View task          | `backlog task 42 --plain`                    |
| List all           | `backlog task list --plain`                  |
| Filter by status   | `backlog task list -s "In Progress" --plain` |
| Filter by assignee | `backlog task list -a @sara --plain`         |
| View board         | `backlog board`                              |
| Archive task       | `backlog task archive 42`                    |

### Definition of Done

A task is **Done** only when ALL of the following are true:

1. ✅ All acceptance criteria checked via CLI
2. ✅ Implementation notes added via CLI
3. ✅ Status set to Done via CLI
4. ✅ Tests pass (`pnpm test`)
5. ✅ Linting passes (`pnpm check`)
6. ✅ Type checking passes (`pnpm typecheck`)
7. ✅ Self-review of changes complete
8. ✅ No regressions

### Common Pitfalls

| Problem              | Fix                                           |
| -------------------- | --------------------------------------------- |
| Task not found       | `backlog task list --plain` to check IDs      |
| AC won't check       | Verify index: `backlog task 42 --plain`       |
| Changes not saving   | Make sure you're using CLI, not editing files |
| Metadata out of sync | Re-edit via CLI to fix                        |

Full help: `backlog --help`

<!-- BACKLOG.MD GUIDELINES END -->
