---
id: TASK-012
title: 'Canvas: Add entity to canvas (toolbar + popover)'
status: To Do
assignee: []
created_date: '2026-03-30 14:57'
updated_date: '2026-03-30 15:01'
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
- [ ] #1 CanvasToolbar component created at src/components/canvas/canvas-toolbar.tsx as a floating overlay (top-left, z-10)
- [ ] #2 Toolbar has Add Entity button, Fit View button, and Clear Canvas button
- [ ] #3 AddEntityPopover created at src/components/canvas/add-entity-popover.tsx using existing Combobox component
- [ ] #4 Popover uses useGameEntities hook to list all game entities, grouped by type
- [ ] #5 Entities already on the canvas are filtered out of the picker
- [ ] #6 On entity select: content_plain_text resolved from listGameEntities query cache, node created at viewport center
- [ ] #7 Fit View button calls reactFlowInstance.fitView()
- [ ] #8 Clear Canvas button clears store with confirmation
<!-- AC:END -->

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
