---
id: TASK-008
title: Disable chat rendering in production builds
status: Done
assignee:
  - '@codex'
created_date: '2026-03-29 16:56'
updated_date: '2026-03-30 14:25'
labels: []
dependencies: []
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Temporarily disable the chat UI from appearing in production builds while keeping it available in development.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Chat navigation is hidden in production builds
- [x] #2 The chat route does not render the chat UI in production builds
- [x] #3 Development builds still expose the existing chat UI
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add a shared production-only chat feature gate.
2. Hide the chat entry from the game sidebar when the gate is off.
3. Prevent the chat route from rendering in production by redirecting to the game dashboard.
4. Run typecheck and a production build to verify the change.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added a shared `isChatEnabled` feature flag in `src/utils/features.ts` that disables chat when `import.meta.env.PROD` is true.
Updated the game sidebar to hide the Chat navigation item in production builds.
Updated the chat route to redirect `/games/$gameId/chat` to `/games/$gameId` in production so the chat UI does not render on direct navigation.
Verification: `pnpm build` passed. `pnpm typecheck` still fails due to pre-existing unrelated type errors in other files, so the task was not marked Done.
<!-- SECTION:NOTES:END -->
