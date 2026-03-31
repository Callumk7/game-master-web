---
id: TASK-012
title: 'Canvas: Add entity to canvas (toolbar + popover)'
status: Done
assignee:
  - '@myself'
created_date: '2026-03-30 14:57'
updated_date: '2026-03-30 16:08'
labels:
  - canvas
  - ui
dependencies:
  - TASK-011
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build the toolbar and add-entity popover that lets users search for and place existing game entities onto the canvas. This is the primary way entities get onto the canvas.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 CanvasToolbar component created at src/components/canvas/canvas-toolbar.tsx as a floating overlay (top-left, z-10)
- [x] #2 Toolbar has Add Entity button, Fit View button, and Clear Canvas button
- [x] #3 AddEntityPopover created at src/components/canvas/add-entity-popover.tsx using existing Combobox component
- [x] #4 Popover uses useGameEntities hook to list all game entities, grouped by type
- [x] #5 Entities already on the canvas are filtered out of the picker
- [x] #6 On entity select: content_plain_text resolved from listGameEntities query cache, node created at viewport center
- [x] #7 Fit View button calls reactFlowInstance.fitView()
- [x] #8 Clear Canvas button clears store with confirmation
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Read useGameEntities hook and Combobox component to understand APIs
2. Read listGameEntities query cache structure for content_plain_text resolution
3. Build AddEntityPopover component
4. Build CanvasToolbar component with Add Entity, Fit View, Clear Canvas
5. Integrate toolbar into GameCanvas component
6. Verify typecheck, lint, formatting pass
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Files Created

### src/components/canvas/add-entity-popover.tsx
- Reuses existing useGameEntities hook for entity listing (flatEntities)
- Filters out entities already on canvas via onCanvasIds Set
- Resolves content_plain_text + type-specific metadata from listGameEntities query cache via queryClient.getQueryData
- extractNodeData() builds CanvasNodeData with metadata per entity type (character: class/level, quest: status, location: type)
- Places new node at viewport center (via reactFlow.screenToFlowPosition) with small random offset to prevent stacking
- Uses existing Combobox primitives with search input, type labels per item, and Escape to close
- Node id format: "${entityType}-${entityId}" ensures uniqueness

### src/components/canvas/canvas-toolbar.tsx
- Floating overlay (absolute left-3 top-3 z-10) with backdrop-blur card styling
- Three buttons: Add Entity (toggles popover), Fit View (reactFlow.fitView with padding+duration), Clear Canvas
- Clear uses sonner confirmation toast with action/cancel pattern
- AddEntityPopover renders conditionally below the toolbar when open

## Files Modified

### src/components/canvas/index.tsx
- Added CanvasToolbar as child of ReactFlow (renders inside the flow container)

No new type/lint errors. 17 pre-existing TS errors and 2 pre-existing biome issues unchanged.
<!-- SECTION:NOTES:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 All acceptance criteria met
- [ ] #2 TypeScript compiles with no errors (pnpm typecheck)
- [ ] #3 Linting passes (pnpm check)
- [ ] #4 Tests pass (pnpm test)
- [ ] #5 Entity can be searched, selected, and placed on canvas from the popover
- [ ] #6 Duplicate entities cannot be added to the canvas
- [ ] #7 Fit View correctly frames all nodes in the viewport
- [ ] #8 Clear Canvas removes all nodes/edges and clears store for the game
- [ ] #9 Toolbar does not obscure canvas interaction (correct z-index layering)
- [ ] #10 No regressions
- [ ] #11 Self-review of changes complete
<!-- DOD:END -->
