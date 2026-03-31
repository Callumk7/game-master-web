---
id: TASK-013
title: 'Canvas: Create links by connecting nodes'
status: Done
assignee:
  - '@myself'
created_date: '2026-03-30 14:57'
updated_date: '2026-03-30 17:18'
labels:
  - canvas
  - api
dependencies:
  - TASK-011
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Wire up the onConnect handler so that drawing an edge between two nodes on the canvas creates a real backend link via the existing useCreateLink hook. This is the core linking feature of the canvas.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 onConnect handler in GameCanvas looks up source/target entityType + entityId from node data in the store
- [x] #2 useCreateLink.mutateAsync() called with correct sourceType, sourceId, entity_type, entity_id
- [x] #3 On success: edge added to canvas store and success toast shown via sonner
- [x] #4 On error: error toast shown, no edge added to canvas
- [x] #5 Duplicate edge prevention — cannot create a link that already exists on canvas
- [x] #6 Edge visually appears only after backend confirms creation (optimistic feel but correct state)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create a useCanvasConnect hook in src/components/canvas/ that:
   - Looks up source/target entityType + entityId from node data in the store
   - Checks for duplicate edges before creating
   - Calls useCreateLink.mutateAsync() with correct params
   - On success: adds edge to canvas store + shows success toast
   - On error: shows error toast, no edge added
2. Wire up the onConnect handler in CanvasInner (src/components/canvas/index.tsx)
3. Run typecheck, lint, and tests to verify
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Files Created

### src/components/canvas/use-canvas-connect.ts — useCanvasConnect hook
- Custom hook returning an async `onConnect` handler for ReactFlow
- Looks up source/target `entityType` + `entityId` from node data via refs to canvas store state
- Duplicate edge prevention: checks both `source→target` and `target→source` directions in existing edges
- Calls `useCreateLink.mutateAsync()` with correct `gameId`, `sourceType`, `sourceId`, `entity_type`, `entity_id`
- On success: adds edge to canvas store via `addEdge()` and shows success toast with entity names
- On error: shows error toast with message, no edge added to store (edge only appears after backend confirmation)
- Uses refs for nodes/edges to keep the callback stable while always reading fresh state

## Files Modified

### src/components/canvas/index.tsx — GameCanvas component
- Imported `useCanvasConnect` hook
- Called `useCanvasConnect(gameId)` in `CanvasInner` component
- Passed `onConnect` handler to `ReactFlow` component

## Notes
- No new TypeScript errors introduced (17 pre-existing remain)
- No new Biome lint/format issues introduced (2 pre-existing errors + 2 warnings remain)
- No test files exist in the project (pre-existing condition)
<!-- SECTION:NOTES:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 All acceptance criteria met
- [ ] #2 TypeScript compiles with no errors (pnpm typecheck)
- [ ] #3 Linting passes (pnpm check)
- [ ] #4 Tests pass (pnpm test)
- [ ] #5 Drawing an edge between two nodes creates a real backend link
- [ ] #6 Success toast confirms link creation
- [ ] #7 Error toast shown and no edge rendered if backend call fails
- [ ] #8 Connecting the same two nodes twice is prevented
- [ ] #9 Created links appear in the entity's links table on the detail page
- [ ] #10 No regressions
- [ ] #11 Self-review of changes complete
<!-- DOD:END -->
