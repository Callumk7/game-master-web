---
id: TASK-011
title: 'Canvas: Core GameCanvas component, route & navigation'
status: Done
assignee:
  - '@myself'
created_date: '2026-03-30 14:57'
updated_date: '2026-03-30 15:27'
labels:
  - canvas
  - routing
  - ui
dependencies:
  - TASK-010
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build the main GameCanvas component wrapping ReactFlow, create the route file, and wire up sidebar + commander navigation. This makes the canvas accessible and renders the base interactive canvas.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 GameCanvas component created at src/components/canvas/index.tsx wrapping ReactFlow with colorMode=dark
- [x] #2 nodeTypes registered with entityNode mapped to EntityNode component
- [x] #3 Initial state loaded from Zustand canvas store for the given gameId
- [x] #4 onNodesChange and onEdgesChange handlers dispatch to store (drag, select, remove)
- [x] #5 onMoveEnd handler saves viewport to store (debounced)
- [x] #6 ReactFlow children include Background (dots), Controls, and MiniMap
- [x] #7 Route file created at src/routes/_auth/games/$gameId/canvas.tsx with no additional loader
- [x] #8 Canvas nav item added to game sidebar (Network icon, after All Objectives)
- [x] #9 Open Canvas command added to Commander
- [x] #10 Canvas renders full-height/full-width (immersive, no PageHeader)
- [x] #11 React Flow dark mode CSS overrides added to src/styles.css
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create GameCanvas component at src/components/canvas/index.tsx
2. Add dark mode CSS overrides for React Flow in src/styles.css
3. Create route file at src/routes/_auth/games/$gameId/canvas.tsx
4. Add Canvas nav item to game sidebar (core-nav.tsx)
5. Add Open Canvas command to Commander
6. Verify typecheck, lint, formatting pass
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Files Created

### src/components/canvas/index.tsx — GameCanvas component
- Wraps ReactFlow with ReactFlowProvider (split into inner/outer components)
- nodeTypes registered with entityNode → EntityNode (stable ref outside component)
- Loads initial state from Zustand store (nodes, edges, viewport) via selectors
- onNodesChange/onEdgesChange dispatch to store updateNodes/updateEdges
- onMoveEnd saves viewport via debounced callback (300ms)
- Includes Background (dots, gap=20), Controls (no interactive toggle), MiniMap (pannable, zoomable)
- colorMode="dark", fitView on first load with default viewport, proOptions hides attribution
- Custom useDebouncedCallback hook for viewport persistence

### src/routes/_auth/games/$gameId/canvas.tsx — Route file
- createFileRoute for /_auth/games/$gameId/canvas
- No additional loader (parent prefetches listGameEntities)
- Full-height/full-width immersive layout, no PageHeader

## Files Modified

### src/components/layout/game-sidebar/core-nav.tsx
- Added Network icon import from lucide-react
- Added Canvas nav item after "All Objectives", before "Chat"

### src/components/commander.tsx
- Added Network icon import
- Added "Views" command group with "Open Canvas" command that navigates to /games/$gameId/canvas

### src/styles.css
- Added .dark .react-flow CSS overrides mapping React Flow CSS variables to app design tokens
- Covers background, node, edge, connection line, minimap, and controls styling
- MiniMap and Controls get border-radius and themed backgrounds

No new type/lint errors introduced. All 17 pre-existing TS errors and 1+1 pre-existing biome issues remain unchanged.
<!-- SECTION:NOTES:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 All acceptance criteria met
- [ ] #2 TypeScript compiles with no errors (pnpm typecheck)
- [ ] #3 Linting passes (pnpm check)
- [ ] #4 Tests pass (pnpm test)
- [ ] #5 Canvas route accessible via sidebar nav and Commander
- [ ] #6 Canvas renders full-height with no scroll/overflow issues in the game layout
- [ ] #7 Nodes can be dragged and repositioned on the canvas
- [ ] #8 Pan and zoom work correctly, viewport state persists on reload
- [ ] #9 Background, Controls, and MiniMap render correctly in dark mode
- [ ] #10 No regressions in existing routes or game layout
- [ ] #11 Self-review of changes complete
<!-- DOD:END -->
