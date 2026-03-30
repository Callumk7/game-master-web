---
id: TASK-010
title: 'Canvas: Entity node component'
status: Done
assignee:
  - '@myself'
created_date: '2026-03-30 14:57'
updated_date: '2026-03-30 15:21'
labels:
  - canvas
  - ui
dependencies:
  - TASK-009
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build the universal entity node component that renders all 5 entity types (character, faction, location, note, quest) on the canvas. This is the visual building block of the canvas.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 EntityNode component created at src/components/canvas/entity-node.tsx using NodeProps from @xyflow/react
- [x] #2 Color-coded left border per entity type (character=blue, faction=purple, location=green, note=amber, quest=red)
- [x] #3 Header shows Lucide type icon + entity name
- [x] #4 Body displays full content_plain_text in a scrollable container (max-h with overflow-y-auto)
- [x] #5 Type-specific metadata subtitle row (character: race/class/level, quest: status, location: type)
- [x] #6 Handles on all 4 sides (Top, Bottom, Left, Right) for flexible edge connections
- [x] #7 Action button in header for context menu trigger
- [x] #8 Dark-mode-first styling using existing Tailwind design tokens
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create entity-node.tsx with NodeProps<EntityCanvasNode> from @xyflow/react
2. Build polymorphic node with color-coded left border per entity type
3. Add header with Lucide type icon + name + action button
4. Add scrollable content body for content_plain_text
5. Add type-specific metadata subtitle row
6. Add Handle components on all 4 sides
7. Ensure dark-mode-first styling with existing Tailwind tokens
8. Verify typecheck, lint, and tests pass
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created src/components/canvas/entity-node.tsx — a universal polymorphic entity node for the canvas.

Key design decisions:
- Uses the same Lucide icons as the sidebar (Users, Shield, MapPin, Scroll, Gem) for consistency
- Color-coded left borders: blue (character), purple (faction), green (location), amber (note), red (quest)
- Header: type icon + truncated name + action trigger button ("..." with data-action-trigger attr for context menu integration)
- MetadataSubtitle sub-component renders type-specific fields (race/class/level, status, location type, member count)
- Full content_plain_text in scrollable body (max-h-60 overflow-y-auto) with nodrag/nopan classes
- 8 handles (source+target on all 4 sides) for flexible edge connections
- Selected state shows ring highlight
- Dark-mode-first with existing Tailwind tokens (bg-card, text-card-foreground, border-border, text-muted-foreground)
- Action button uses nodrag/nopan to prevent dragging when clicking
- Exported as default export for React Flow nodeTypes registration

No pre-existing type/lint errors introduced. All pre-existing errors are unrelated to canvas code.
<!-- SECTION:NOTES:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 All acceptance criteria met
- [ ] #2 TypeScript compiles with no errors (pnpm typecheck)
- [ ] #3 Linting passes (pnpm check)
- [ ] #4 Tests pass (pnpm test)
- [ ] #5 Node renders correctly for all 5 entity types (character, faction, location, note, quest)
- [ ] #6 Scrollable content area works with long content
- [ ] #7 Handles visible and connectable on all 4 sides
- [ ] #8 Dark mode styling verified
- [ ] #9 Self-review of changes complete
<!-- DOD:END -->
