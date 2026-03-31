---
id: TASK-014
title: 'Canvas: Load existing links for a node'
status: Done
assignee:
  - '@myself'
created_date: '2026-03-30 14:58'
updated_date: '2026-03-31 15:19'
labels:
  - canvas
  - api
  - ui
dependencies:
  - TASK-011
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build the load-links hook, radial layout utility, and node context menu so users can expand the graph by loading all existing links for any node on the canvas. This is the graph exploration feature.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 useLoadLinks hook created at src/components/canvas/hooks/use-load-links.ts
- [x] #2 Hook uses queryClient.fetchQuery with the correct per-entity-type link query (getCharacterLinks, etc.)
- [x] #3 flattenLinksForTable reused to normalize the link response
- [x] #4 Entities already on canvas are filtered out (no duplicates)
- [x] #5 Radial layout utility created at src/components/canvas/utils/layout.ts distributing new nodes in a circle around the source node
- [x] #6 Node context menu created at src/components/canvas/node-context-menu.tsx using existing DropdownMenu
- [x] #7 Context menu has Load Links, View Entity (navigates to detail page), and Remove from Canvas actions
- [x] #8 Remove from Canvas removes node + connected edges from store without deleting the backend entity
- [x] #9 Loading state shown on the node while links are being fetched
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create radial layout utility at src/components/canvas/utils/layout.ts
2. Create useLoadLinks hook at src/components/canvas/hooks/use-load-links.ts
3. Create node context menu at src/components/canvas/node-context-menu.tsx
4. Wire context menu into entity-node.tsx (replace action button)
5. Run typecheck, lint, and tests to verify
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Files Created

### src/components/canvas/utils/layout.ts — radialLayout utility
- Pure function distributing N positions evenly in a circle around a center point
- Starts at top (−π/2) so first node appears above the source
- Single-node case places directly to the right
- Default radius of 300px

### src/components/canvas/hooks/use-load-links.ts — useLoadLinks hook
- Imperative hook returning `{ loadLinks, loadingNodeId }`
- `loadLinks(nodeId)` fetches all links for the node via `queryClient.fetchQuery` with the correct per-entity-type link options (getCharacterLinksOptions, getFactionLinksOptions, etc.)
- Reuses `flattenLinksForTable` from existing links utils to normalize the response
- Filters out entities already on canvas (deduplication by type:id)
- Positions new nodes radially around source using `radialLayout`
- Adds new nodes and edges to canvas store, skipping duplicate edges
- Shows informative toasts: success count, "all on canvas already", "no links found", or error
- Uses refs for fresh state without callback recreation

### src/components/canvas/node-context-menu.tsx — NodeContextMenu component
- Uses existing DropdownMenu from ui primitives (Base UI, not Radix)
- Three actions: Load Links, View Entity, Remove from Canvas
- Load Links: calls shared `loadLinks` from CanvasContext with loading/disabled state
- View Entity: navigates to entity detail page via TanStack Router
- Remove from Canvas: calls store `removeNode` (removes node + connected edges, no backend delete)
- Trigger button uses `nodrag nopan` classes to prevent canvas interaction conflicts

## Files Modified

### src/components/canvas/entity-node.tsx
- Added `CanvasContext` (replaces simple gameId context) sharing `gameId`, `loadLinks`, and `loadingNodeId`
- Entity node now shows spinning Loader2 icon when its links are being fetched
- Replaced plain "..." button with `NodeContextMenu` component
- Removed unused MoreHorizontal import

### src/components/canvas/index.tsx
- Calls `useLoadLinks(gameId)` once in CanvasInner
- Provides `CanvasContext.Provider` with shared `{ gameId, loadLinks, loadingNodeId }` via memoized value
- Ensures single source of truth for loading state across all EntityNode and NodeContextMenu instances

## Architecture Notes
- Loading state is shared via React Context (created in entity-node.tsx, provided in index.tsx) to avoid each node having independent hook instances
- No new TypeScript errors introduced (17 pre-existing remain)
- No new Biome lint/format issues (1 pre-existing error + 2 warnings remain — actually improved from 2 errors via formatting fix)
- No test files exist in the project (pre-existing condition)
<!-- SECTION:NOTES:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 All acceptance criteria met
- [ ] #2 TypeScript compiles with no errors (pnpm typecheck)
- [ ] #3 Linting passes (pnpm check)
- [ ] #4 Tests pass (pnpm test)
- [ ] #5 Load Links action fetches and displays linked entities for all 5 entity types
- [ ] #6 New nodes appear radially positioned around the source node
- [ ] #7 Already-present entities are not duplicated on the canvas
- [ ] #8 View Entity navigates to the correct detail page
- [ ] #9 Remove from Canvas removes node + edges without deleting backend data
- [ ] #10 No regressions
- [ ] #11 Self-review of changes complete
<!-- DOD:END -->
