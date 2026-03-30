---
id: TASK-013
title: 'Canvas: Create links by connecting nodes'
status: To Do
assignee: []
created_date: '2026-03-30 14:57'
updated_date: '2026-03-30 15:01'
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
- [ ] #1 onConnect handler in GameCanvas looks up source/target entityType + entityId from node data in the store
- [ ] #2 useCreateLink.mutateAsync() called with correct sourceType, sourceId, entity_type, entity_id
- [ ] #3 On success: edge added to canvas store and success toast shown via sonner
- [ ] #4 On error: error toast shown, no edge added to canvas
- [ ] #5 Duplicate edge prevention — cannot create a link that already exists on canvas
- [ ] #6 Edge visually appears only after backend confirms creation (optimistic feel but correct state)
<!-- AC:END -->

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
