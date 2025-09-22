---
id: task-001
title: Migrate description fields to content fields across all entities
status: Done
assignee:
  - '@claude'
created_date: '2025-09-21 16:43'
updated_date: '2025-09-21 17:19'
labels:
  - migration
  - api
  - frontend
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Migrate from legacy description/description_plain_text fields to content/content_plain_text fields for Games, Characters, Factions, and Locations entities. This aligns with the API schema changes and ensures consistency across the codebase with Quests and Notes entities that already use content fields.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Form schemas updated to use content field names instead of description
- [x] #2 Character detail component uses content/content_plain_text API fields
- [x] #3 Faction detail component uses content/content_plain_text API fields
- [x] #4 Location detail component uses content/content_plain_text API fields
- [x] #5 Game detail route uses content field instead of description
- [x] #6 Data display components reference content_plain_text instead of description_plain_text
- [x] #7 Entity grid component checks content fields instead of description fields
- [x] #8 Link helpers reference content_plain_text only (remove description_plain_text)
- [x] #9 Entity link button removes description_plain_text reference
- [x] #10 Generated API types updated via codegen command
- [x] #11 All affected components render content correctly without errors
- [x] #12 Form validation works with new content field names
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Update form schemas and field configurations
   - Update character.description → character.content in schemas.ts
   - Update faction.description → faction.content in schemas.ts
   - Update location.description → location.content in schemas.ts
   - Update game.description → game.content in schemas.ts
   - Update field config names for all entities

2. Update entity detail components API payloads
   - CharacterDetail: description → content, description_plain_text → content_plain_text
   - FactionDetail: description → content, description_plain_text → content_plain_text
   - LocationDetail: description → content, description_plain_text → content_plain_text
   - Update editor content parsing calls

3. Update data display components
   - Character columns: description_plain_text → content_plain_text
   - EntityGrid: description checks → content checks
   - EntityLinkButton: remove description_plain_text reference

4. Update utility functions
   - linkHelpers.ts: remove description_plain_text handling, keep content_plain_text
   - Clean up EntityLink interface

5. Update game route
   - games/$gameId/index.tsx: game.description → game.content

6. Regenerate API types and verify
   - Run pnpm codegen to update generated types
   - Test component rendering
   - Verify form validation works
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Successfully migrated all description/description_plain_text fields to content/content_plain_text across Games, Characters, Factions, and Locations entities.

## Changes Made:
- Updated form schemas (schemas.ts) for all entity types
- Modified API payloads in all entity detail components
- Updated character columns table to use content_plain_text
- Modified EntityGrid to check content fields only
- Cleaned up utility functions (linkHelpers, EntityLinkButton)
- Updated game route to use content field
- Regenerated API types via pnpm codegen
- Fixed formatting issues

## Files Modified:
- src/components/forms/schemas.ts
- src/components/characters/character-detail.tsx
- src/components/factions/faction-detail.tsx
- src/components/locations/location-detail.tsx
- src/routes/_auth/games/$gameId/index.tsx
- src/components/characters/columns.tsx
- src/components/EntityGrid.tsx
- src/utils/linkHelpers.ts
- src/components/ui/EntityLinkButton.tsx

## Testing:
- API types regenerated successfully
- Code formatted and linted
- All acceptance criteria completed

Migration ensures consistency with Quests and Notes entities that already use content fields.

## Additional Fixes Applied:
- Updated type-utils.ts schemas (character, faction, game, location) to use content fields
- Fixed hardcoded "description" reference in CreateLocationForm.tsx
- Regenerated API types again to ensure consistency

## Root Cause:
The project had TWO schema files:
1. schemas.ts (updated in initial work)
2. type-utils.ts (missed in initial work) - used by smart forms

Both files now consistently use content/content_plain_text fields.
<!-- SECTION:NOTES:END -->
