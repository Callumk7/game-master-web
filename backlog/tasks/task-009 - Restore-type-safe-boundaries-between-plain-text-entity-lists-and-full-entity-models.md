---
id: TASK-009
title: >-
  Restore type-safe boundaries between plain-text entity lists and full entity
  models
status: To Do
assignee: []
created_date: '2026-03-29 18:14'
updated_date: '2026-03-29 18:14'
labels:
  - quality
  - types
  - api
  - frontend
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The consolidated game-entities query now returns EntityPlainText* payloads, but several shared UI flows still treat that data as full Character/Faction/Location/Note/Quest models. This is breaking typecheck and risks edit/search flows running with incomplete entity data. Introduce a clear boundary so plain-text list responses are only used where appropriate, and full entity data is fetched or adapted explicitly where richer fields are required.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Commander, edit-dialog entry points, and split-view selector stop reading fields that are absent from plain-text entity payloads
> tsc --noEmit

src/components/characters/edit-character-dialog.tsx(23,4): error TS2322: Type 'EntityPlainTextCharacter' is not assignable to type 'Note | Character | Quest | Location'.
  Type 'EntityPlainTextCharacter' is missing the following properties from type 'Character': alive, pinned, user_id
src/components/commander.tsx(331,31): error TS2339: Property 'content' does not exist on type 'EntityPlainTextCharacter'.
src/components/commander.tsx(379,29): error TS2339: Property 'content' does not exist on type 'EntityPlainTextFaction'.
src/components/commander.tsx(420,30): error TS2339: Property 'content' does not exist on type 'EntityPlainTextLocation'.
src/components/commander.tsx(461,26): error TS2339: Property 'content' does not exist on type 'EntityPlainTextNote'.
src/components/commander.tsx(502,27): error TS2339: Property 'content' does not exist on type 'EntityPlainTextQuest'.
src/components/error.tsx(7,38): error TS2345: Argument of type '_Error' is not assignable to parameter of type 'ValidationError'.
  Property 'errors' is missing in type '_Error' but required in type 'ValidationError'.
src/components/factions/edit-faction-dialog.tsx(23,4): error TS2322: Type 'EntityPlainTextFaction' is not assignable to type 'Note | Character | Quest | Location'.
  Type 'EntityPlainTextFaction' is missing the following properties from type 'Location': pinned, type
src/components/layout/split-view/hooks/use-entity-selector.ts(23,44): error TS2345: Argument of type 'EntitiesPlainText | undefined' is not assignable to parameter of type 'Entities | undefined'.
  Type 'EntitiesPlainText' is not assignable to type 'Entities'.
    Types of property 'characters' are incompatible.
      Type 'EntityPlainTextCharacter[] | undefined' is not assignable to type 'Character[] | undefined'.
        Type 'EntityPlainTextCharacter[]' is not assignable to type 'Character[]'.
          Type 'EntityPlainTextCharacter' is missing the following properties from type 'Character': alive, pinned, user_id
src/components/locations/edit-location-dialog.tsx(23,4): error TS2322: Type 'EntityPlainTextLocation' is not assignable to type 'Note | Character | Quest | Location'.
  Property 'pinned' is missing in type 'EntityPlainTextLocation' but required in type 'Location'.
src/components/login.tsx(17,29): error TS2345: Argument of type '_Error' is not assignable to parameter of type 'ValidationError'.
  Property 'errors' is missing in type '_Error' but required in type 'ValidationError'.
src/components/notes/edit-note-dialog.tsx(22,21): error TS2322: Type 'EntityPlainTextNote' is not assignable to type 'Note | Character | Quest | Location'.
  Type 'EntityPlainTextNote' is missing the following properties from type 'Location': pinned, type
src/components/quests/edit-quest-dialog.tsx(21,21): error TS2322: Type 'EntityPlainTextQuest' is not assignable to type 'Note | Character | Quest | Location'.
  Type 'EntityPlainTextQuest' is missing the following properties from type 'Quest': pinned, user_id
src/lib/smart-form-factory/core/form-factory.tsx(210,26): error TS2345: Argument of type 'ApiError' is not assignable to parameter of type 'ValidationError'.
  Types of property 'errors' are incompatible.
    Type 'ErrorDetails | undefined' is not assignable to type '{ [key: string]: string[]; }'.
      Type 'undefined' is not assignable to type '{ [key: string]: string[]; }'.
src/lib/smart-form-factory/core/smart-form.tsx(237,26): error TS2345: Argument of type 'ApiError' is not assignable to parameter of type 'ValidationError'.
  Types of property 'errors' are incompatible.
    Type 'ErrorDetails | undefined' is not assignable to type '{ [key: string]: string[]; }'.
      Type 'undefined' is not assignable to type '{ [key: string]: string[]; }'.
src/routes/_auth/games/$gameId/characters/$id/route.tsx(38,39): error TS2345: Argument of type 'Error & _Error' is not assignable to parameter of type 'ValidationError'.
  Property 'errors' is missing in type 'Error & _Error' but required in type 'ValidationError'.
src/routes/_auth/games/$gameId/characters/$id/route.tsx(44,39): error TS2345: Argument of type '_Error' is not assignable to parameter of type 'ValidationError'.
  Property 'errors' is missing in type '_Error' but required in type 'ValidationError'.
 ELIFECYCLE  Command failed with exit code 2. no longer fails due to EntityPlainText versus full entity type mismatches
- [ ] #2 Shared query and transformer utilities encode the plain-text/full-entity distinction explicitly in their types
- [ ] #3 Any UI flow that requires full entity fields fetches or derives the correct model instead of relying on listGameEntities output
- [ ] #4 The implementation documents the intended usage of consolidated plain-text entity responses to prevent regression
- [ ] #5 pnpm typecheck no longer fails due to EntityPlainText versus full entity type mismatches
<!-- AC:END -->
