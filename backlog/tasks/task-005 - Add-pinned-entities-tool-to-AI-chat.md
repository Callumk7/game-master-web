---
id: task-005
title: Add pinned entities tool to AI chat
status: Done
assignee:
  - '@claude'
created_date: '2025-12-30'
updated_date: '2025-12-30'
labels:
  - ai
  - chat
  - session-planning
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement a `listPinnedEntities` tool for the AI chat assistant to query which entities (characters, quests, factions, locations, notes) are currently pinned by the GM. Pinned entities represent what the GM considers most important RIGHT NOW, making this tool essential for session planning. The API endpoint already exists and just needs to be wrapped as an AI tool with proper schema definition.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Import `listPinnedEntities` function from `~/api/sdk.gen`
- [x] #2 Create tool definition with proper Zod schema (gameId parameter)
- [x] #3 Add tool to the exported `tools` object in `src/ai/tools.ts`
- [x] #4 Update system prompt to mention pinned entities capability for session planning
- [x] #5 Test tool returns pinned entities correctly with different game states
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add listPinnedEntities to imports in src/ai/tools.ts
2. Create listPinnedEntities tool definition with gameId schema
3. Add tool to tools export object
4. Update system prompt in src/ai/system-prompt.ts to mention pinned entities
5. Test with different scenarios (no pinned entities, multiple pinned entities)
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Successfully implemented listPinnedEntities tool for AI chat assistant. Added import for listPinnedEntities from SDK, created tool definition with gameId parameter schema, and integrated into tools export. Updated system prompt to highlight this as a session planning tool under "Read Tools" section. The tool returns all pinned entities (characters, quests, factions, locations, notes) that the GM has marked as important, providing the AI with immediate context on what's most relevant for the current campaign state.

Implementation files modified:
- src/ai/tools.ts: Added listPinnedEntities import and tool definition
- src/ai/system-prompt.ts: Added "Session Planning Tools" section mentioning listPinnedEntities

The tool is ready for use and will help GMs focus on their most important entities during session planning.
<!-- SECTION:NOTES:END -->
