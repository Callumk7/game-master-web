---
id: task-007
title: Add quest objectives tool to AI chat
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
Implement a `listQuestObjectives` tool for the AI chat assistant to query all objectives for a specific quest along with their completion status. Quests in the system have objectives that track progress - this is crucial information for session planning. The tool will help GMs and the AI understand what objectives are complete vs incomplete for any quest, enabling better planning of next steps and tracking campaign progress. The API endpoint `listObjectives(questId)` already exists and just needs to be wrapped as an AI tool.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Import `listObjectives` function from `~/api/sdk.gen`
- [x] #2 Create `listQuestObjectives` tool with proper Zod schema (gameId and questId parameters)
- [x] #3 Add tool to the exported `tools` object in `src/ai/tools.ts`
- [x] #4 Update system prompt to explain quest objectives and how to query them
- [x] #5 Test tool returns objectives with correct completion status for various quests
- [x] #6 Handle edge cases (quest with no objectives, invalid quest ID)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add listObjectives to imports in src/ai/tools.ts
2. Create listQuestObjectives tool definition with gameId and questId parameters
3. Add proper error handling for edge cases
4. Add tool to tools export object
5. Update system prompt to explain quest objectives feature
6. Test with various scenarios
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Successfully implemented listQuestObjectives tool for AI chat assistant. Added import for listObjectives from SDK, created tool definition with both gameId and questId parameters, and integrated proper error handling for edge cases (no objectives, invalid quest ID).

Implementation details:
- Created tool with gameId and questId parameters using Zod schema
- Added try/catch error handling to gracefully handle API failures
- Returns empty array if no objectives exist
- Returns error object with details if API call fails
- Added to tools export in src/ai/tools.ts
- Updated system prompt to explain quest objectives feature under Session Planning Tools

The tool enables detailed quest tracking queries like "What objectives are left for the Dragon Quest?" or "Show me progress on quest objectives". This allows GMs to track individual tasks within quests and plan next steps based on what's completed vs incomplete.

Files modified:
- src/ai/tools.ts: Added listObjectives import and listQuestObjectives tool with error handling
- src/ai/system-prompt.ts: Added tool to Session Planning Tools section
<!-- SECTION:NOTES:END -->
