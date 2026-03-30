---
id: TASK-014
title: 'Canvas: Load existing links for a node'
status: To Do
assignee: []
created_date: '2026-03-30 14:58'
updated_date: '2026-03-30 15:02'
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
- [ ] #1 useLoadLinks hook created at src/components/canvas/hooks/use-load-links.ts
- [ ] #2 Hook uses queryClient.fetchQuery with the correct per-entity-type link query (getCharacterLinks, etc.)
- [ ] #3 flattenLinksForTable reused to normalize the link response
- [ ] #4 Entities already on canvas are filtered out (no duplicates)
- [ ] #5 Radial layout utility created at src/components/canvas/utils/layout.ts distributing new nodes in a circle around the source node
- [ ] #6 Node context menu created at src/components/canvas/node-context-menu.tsx using existing DropdownMenu
- [ ] #7 Context menu has Load Links, View Entity (navigates to detail page), and Remove from Canvas actions
- [ ] #8 Remove from Canvas removes node + connected edges from store without deleting the backend entity
- [ ] #9 Loading state shown on the node while links are being fetched
<!-- AC:END -->

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
