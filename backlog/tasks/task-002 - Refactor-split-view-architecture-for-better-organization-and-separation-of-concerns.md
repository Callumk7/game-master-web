---
id: task-002
title: >-
  Refactor split view architecture for better organization and separation of
  concerns
status: To Do
assignee: []
created_date: '2025-10-05 16:44'
updated_date: '2025-10-05 16:46'
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Current Implementation Analysis

### Files Involved in Split View Feature:

**Route Configuration:**
-  - Route definition with search parameter validation (Zod schema)

**Core Components:**
-  (~195 lines) - Main layout component handling:
  - Navigation state management
  - Pane updating logic
  - Entity selector modal state
  - Layout structure with resizable panels

-  (~504 lines) - Entity display component with:
  - Entity type routing and query management
  - Individual entity content components (Character, Faction, Location, Note, Quest)
  - Data fetching for each entity type
  - Update mutation handling
  - Refresh functionality

-  (~380 lines) - Entity selection modal:
  - Multiple entity type queries (characters, factions, locations, notes, quests)
  - Search filtering logic
  - Tab-based entity type navigation
  - Entity item rendering with badges

**Supporting Components:**
-  - Custom resizable panel wrapper
- Integration points in  (split view button)
- Integration points in  (split view from tabs)

### Current Architecture Issues:

**Mixed Responsibilities:**
1. **EntityPane** combines:
   - Data fetching (5 different query hooks)
   - Mutation handling (5 different update mutations)  
   - Component routing logic
   - UI rendering
   - State management for each entity type

2. **EntitySelector** combines:
   - Data fetching for all entity types
   - Search filtering business logic
   - UI state management (search query)
   - Modal presentation logic
   - Entity rendering with complex badge layout

3. **SplitViewLayout** combines:
   - URL state management
   - Navigation logic
   - Modal state management
   - Layout structure
   - Event handling

**Code Duplication:**
- Similar data fetching patterns repeated across entity types
- Similar mutation handling patterns across entity types
- Repeated entity rendering logic

**Testing Challenges:**
- Components are difficult to unit test due to mixed concerns
- Hard to mock data layer when it's embedded in UI components
- Complex component setup required for testing individual features

**Type Safety Issues:**
- Entity types are handled with 'any' types in several places
- No shared interfaces for entity operations
- Component props interfaces could be more specific
<!-- SECTION:NOTES:END -->
