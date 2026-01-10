---
id: task-006
title: Add active quests filter tool to AI chat
status: Done
assignee:
  - '@claude'
created_date: '2025-12-30'
updated_date: '2025-12-30'
labels:
  - ai
  - chat
  - session-planning
  - quests
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement a `listActiveQuests` tool for the AI chat assistant to query only quests with 'active' status. Currently, `listQuests` returns ALL quests regardless of status (preparing, completed, cancelled, etc.), making it difficult for the AI to focus on current storylines. GMs need to see ONLY what's happening now, not the 50+ completed quests from previous sessions. This tool will filter the existing quest list to show only active storylines, which is essential for session planning.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Create `listActiveQuests` tool that filters quests by status='active'
- [x] #2 Tool uses existing `listQuests` API and filters client-side
- [x] #3 Add proper Zod schema with gameId parameter
- [x] #4 Add tool to the exported `tools` object in `src/ai/tools.ts`
- [x] #5 Update system prompt to explain when to use active quests vs all quests
- [x] #6 Test tool returns only active quests, excluding preparing/completed/cancelled
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create listActiveQuests tool definition in src/ai/tools.ts
2. Use existing listQuests API call and filter by status === 'active'
3. Add proper Zod schema with gameId parameter
4. Add tool to tools export object
5. Update system prompt to explain when to use listActiveQuests vs listQuests
6. Test filtering works correctly
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Successfully implemented listActiveQuests tool for AI chat assistant. Created tool definition that calls existing listQuests API and filters results client-side to only include quests with status === 'active'. This provides the AI with focused access to current ongoing storylines without the noise of completed, cancelled, or preparing quests.

Implementation details:
- Created tool with gameId parameter using Zod schema
- Uses Array.filter() to client-side filter quest results
- Added to tools export in src/ai/tools.ts
- Updated system prompt to explain when to use listActiveQuests vs listQuests

The tool enables session planning queries like "What quests are currently active?" or "Show me ongoing storylines" to return only relevant, in-progress quests. This dramatically improves the AI's ability to focus on what matters for the current session.

Files modified:
- src/ai/tools.ts: Added listActiveQuests tool with filtering logic
- src/ai/system-prompt.ts: Added tool to Session Planning Tools section
<!-- SECTION:NOTES:END -->
