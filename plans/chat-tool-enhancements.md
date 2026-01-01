# Chat Tool Enhancements for Session Planning

## Overview

This document outlines proposed enhancements to the AI chat assistant tools to better support Game Masters in session planning and campaign management.

## Goals

1. **Session Planning**: Help GMs prepare and plan upcoming sessions
2. **Quest Tracking**: Keep track of important quests that are currently ongoing
3. **Adventure Hooks**: Tailor adventure hooks to campaign lore and recent events

## Current State

### Existing Tools (15 total)
- ✅ Read operations: get/list for all 5 entity types (characters, factions, locations, quests, notes)
- ✅ Get entity links (relationships between entities)
- ✅ Create operations: for all 5 entity types with TipTap JSON support

### Missing Capabilities
- ❌ No aggregated/filtered queries (e.g., "active quests only")
- ❌ No entity tree/hierarchy tools (though API supports them)
- ❌ No objective management tools (quests have objectives!)
- ❌ No pinned entities access (important for session planning)
- ❌ No update/mutation tools beyond creation

## Proposed Enhancements

### Phase 1: Quick Wins (Priority: HIGHEST)

#### 1. Pinned Entities Tool ⭐⭐⭐
**API:** `listPinnedEntities` (already exists)
**Description:** Get all pinned entities that are important to the current campaign
**Value:** Pinned entities represent what the GM considers most important RIGHT NOW - perfect for session planning
**Effort:** Low (API exists, just needs tool wrapper)

#### 2. Active Quests Filter Tool ⭐⭐⭐
**API:** Filter `listQuests` by status
**Description:** Get only quests with 'active' status - the current ongoing storylines
**Value:** GMs need to see ONLY what's happening now, not all completed/cancelled quests
**Effort:** Low (client-side filter of existing tool)

#### 3. Quest Objectives Tool ⭐⭐⭐
**API:** `listObjectives(questId)` (already exists)
**Description:** Get all objectives for a specific quest with completion status
**Value:** Quests have objectives - crucial for tracking progress and planning next steps
**Effort:** Low (API exists, just needs tool wrapper)

### Phase 2: Quest Management (Priority: HIGH)

#### 4. Quest Status Update Tool
**API:** `updateQuest` (already exists)
**Description:** Update a quest's status (preparing → active → completed)
**Value:** Session planning often involves starting/completing quests
**Effort:** Medium (need to expose update API)

#### 5. Objective Completion Tools
**API:** `completeObjective`, `uncompleteObjective` (already exist)
**Description:** Mark quest objectives as complete/incomplete
**Value:** Track progress during session planning
**Effort:** Low (APIs exist)

#### 6. Create Quest Objective Tool
**API:** `createObjective` (already exists)
**Description:** Add new objectives to existing quests
**Value:** Session planning often adds new objectives to quests
**Effort:** Low (API exists)

### Phase 3: Enhanced Queries (Priority: MEDIUM)

#### 7. Game Entity Tree Tool
**API:** `getGameEntityTree` (already exists)
**Description:** Get complete hierarchical structure of all entities and relationships
**Value:** Gives AI a "bird's eye view" of the entire campaign
**Effort:** Low (API exists)

#### 8. List All Game Objectives
**API:** `listGameObjectives` (already exists)
**Description:** Get all quest objectives across the entire game
**Value:** See all tasks at once, track overall campaign progress
**Effort:** Low (API exists)

#### 9. Faction Members Tool
**API:** `getFactionMembers` (already exists)
**Description:** Get all characters who are members of a faction
**Value:** Useful for NPC planning and faction storylines
**Effort:** Low (API exists)

#### 10. Recent Activity Query
**API:** Client-side sorting or new endpoint
**Description:** Get recently created/updated entities
**Value:** Understand latest campaign developments, provide context for hooks
**Effort:** Medium (client-side filter) or High (new API endpoint)

### Phase 4: Smart Aggregation (Priority: MEDIUM-LOW)

#### 11. Campaign Context Aggregator
**API:** Composition of existing endpoints or new aggregation endpoint
**Description:** Get summary of campaign state: active quests, key characters, recent notes, setting info
**Value:** Single tool for AI to get full context for adventure hook generation
**Effort:** High (aggregation logic needed)

#### 12. Entity Tag Search
**API:** Client-side filter or new endpoint
**Description:** Find all entities with specific tags
**Value:** Organize and query campaign elements by theme/category
**Effort:** Medium (client-side) or High (new endpoint)

## Implementation Recommendation

### Immediate Priority (Phase 1)
Start with tools 1-3 as they:
- Require minimal implementation effort
- Provide immediate value for session planning
- Leverage existing API endpoints
- Address the most common GM workflow: "What's happening now?"

### Use Cases
- **Pinned Entities**: "What should I focus on tonight?"
- **Active Quests**: "What storylines are currently ongoing?"
- **Quest Objectives**: "What objectives are left for the Dragon Quest?"

## Next Steps

1. Implement Phase 1 tools (1-3)
2. Test with real session planning scenarios
3. Gather feedback on value vs. effort
4. Prioritize Phase 2 based on usage patterns
5. Consider Phase 3-4 for future iterations

## Questions to Consider

1. Are pinned entities the most important context for session planning?
2. How important is objective tracking vs. just quest status?
3. What context is most valuable for adventure hook generation?
4. What other update operations are needed during sessions?
5. What filtering capabilities would be most useful?
