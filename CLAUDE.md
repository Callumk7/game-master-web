# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

> **📖 Shared project context lives in `AGENTS.md`** — architecture, tech stack, directory
> structure, coding guidelines, and task management. Read that file first. This file contains
> only Claude-specific behavioural notes.

---

## Key Reminders for Claude

### Before You Code
- Run `pnpm check` and `pnpm typecheck` to validate changes
- Run `pnpm test` to catch regressions
- Never run `pnpm dev` yourself — ask the user to test manually

### Type Safety (Non-Negotiable)
- **NEVER use `as any`** — find the correct type. No exceptions.
- Always import React as namespace: `import * as React from "react"`
- All generated files (`src/api/`, `src/routeTree.gen.ts`) are read-only

### Component Conventions
- Use `src/components/ui/` primitives whenever possible
- We use **Base UI**, not Radix — use `render` prop, never `asChild`
- Single responsibility — complex components get their own folder
- Dark mode is the default; design for dark first

### Task Management
- Use the `backlog` CLI for all task operations (see AGENTS.md for full reference)
- Never edit task files in `backlog/` directly
- Always use `--plain` flag when viewing/listing tasks
