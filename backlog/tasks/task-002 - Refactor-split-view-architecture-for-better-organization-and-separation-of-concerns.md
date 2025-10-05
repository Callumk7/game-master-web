---
id: task-002
title: >-
  Refactor split view architecture for better organization and separation of
  concerns
status: To Do
assignee: []
created_date: '2025-10-05 16:44'
updated_date: '2025-10-05 16:44'
labels:
  - refactoring
  - architecture
  - split-view
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The current split view implementation has grown into several large files with mixed responsibilities. We need to restructure the code into focused, single-responsibility modules with clear separation between data fetching, state management, and UI rendering.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Split large components into focused, single-responsibility modules
- [ ] #2 Separate data fetching logic from UI components
- [ ] #3 Extract state management into dedicated hooks or context
- [ ] #4 Create clear component hierarchy with proper abstractions
- [ ] #5 Ensure components follow single responsibility principle
- [ ] #6 Add proper TypeScript interfaces for component contracts
- [ ] #7 Update imports and exports to maintain clean API boundaries
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Analyze current split view implementation to identify responsibilities and dependencies\n2. Design new component architecture with clear separation of concerns:\n   - Data layer: Custom hooks for entity fetching and mutations\n   - State layer: Context or hooks for split view state management\n   - UI layer: Pure presentational components\n3. Create dedicated modules:\n   - hooks/ - Custom hooks for data fetching and state\n   - context/ - Split view context for global state\n   - components/ - Pure UI components\n   - types/ - Shared TypeScript interfaces\n4. Refactor existing components to use new architecture\n5. Update component organization:\n   - Break down EntityPane into smaller components\n   - Extract EntitySelector search and filtering logic\n   - Separate SplitViewLayout state management\n6. Add proper error boundaries and loading states\n7. Test refactored implementation to ensure functionality is preserved
<!-- SECTION:PLAN:END -->
