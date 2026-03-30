---
id: TASK-009
title: 'Canvas: Zustand store & types'
status: Done
assignee:
  - '@myself'
created_date: '2026-03-30 14:57'
updated_date: '2026-03-30 15:18'
labels:
  - canvas
  - foundation
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Set up the foundational state management and type definitions for the canvas feature. This is the base layer everything else builds on.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Zustand canvas store created at src/state/canvas.ts with persist middleware (localStorage)
- [x] #2 Store state shape includes canvases map keyed by gameId, each with nodes, edges, and viewport
- [x] #3 All store actions implemented: addNode, removeNode, updateNodes, addEdge, removeEdge, updateEdges, setViewport, clearCanvas
- [x] #4 Canvas-specific types defined at src/components/canvas/types.ts (CanvasNodeData, EntityCanvasNode)
- [x] #5 Selectors exported following project convention (useCanvasNodes, useCanvasEdges, useCanvasActions, etc.)
- [x] #6 TypeScript compiles with no errors (pnpm typecheck)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create canvas types at src/components/canvas/types.ts
2. Create Zustand canvas store at src/state/canvas.ts following todos.ts pattern
3. Verify typecheck and lint pass
<!-- SECTION:PLAN:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 All acceptance criteria met
- [x] #2 TypeScript compiles with no errors (pnpm typecheck)
- [x] #3 Linting passes (pnpm check)
- [x] #4 Tests pass (pnpm test)
- [x] #5 Store actions manually verified: addNode, removeNode, updateNodes, addEdge, removeEdge, updateEdges, setViewport, clearCanvas
- [x] #6 localStorage persistence verified: state survives page reload
- [x] #7 Self-review of changes complete
<!-- DOD:END -->
