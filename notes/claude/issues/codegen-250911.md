Problem Summary

  The OpenAPI code generator is inconsistently handling request body types for different entity endpoints, causing some operations to work while others
  fail.

  What's Working vs What's Broken

  ✅ Working Correctly:

- Notes: CreateNoteData and UpdateNoteData both correctly show body: NoteRequest
  - Games: CreateGameData and UpdateGameData both correctly show body: GameRequest
  - Auth: Login/Signup operations correctly show request bodies

  ❌ Broken (showing body?: never):

  - Locations: CreateLocationData and UpdateLocationData
  - Characters: CreateCharacterData and UpdateCharacterData
  - Factions: CreateFactionData and UpdateFactionData
  - Quests: CreateQuestData and UpdateQuestData

  OpenAPI Schema Analysis

  In server/schema/swagger.json, all endpoints correctly define request bodies:

  // Location create/update endpoints
  "parameters": [{
  "description": "Location updates",
  "in": "body",
  "name": "location",
  "required": true,
  "schema": {
  "$ref": "#/definitions/LocationRequest"
  }
  }]

  The schema consistently shows:
  - LocationRequest contains { location: LocationParams }
  - CharacterRequest contains { character: CharacterParams }
  - FactionRequest contains { faction: FactionParams }
  - etc.

  Code Generation Inconsistency

  The codegen is parsing some endpoints correctly but not others, despite identical schema patterns:

  Working pattern (Notes):
  export type CreateNoteData = {
  body: NoteRequest;  // ✅ Correct
  path: { game_id: number };
  // ...
  }

  Broken pattern (Locations):
  export type CreateLocationData = {
  body?: never;  // ❌ Wrong - should be LocationRequest
  path: { game_id: number };
  // ...
  }

  Impact on Form Factory

  The form factory in factory-v2.tsx correctly wraps data as { [entityName]: validatedData }, which produces:
  - { location: { name: "...", type: "city", ... } }

  This matches the expected LocationRequest format from the OpenAPI schema, but the incorrect TypeScript types (body?: never) prevent the request body
  from being sent.

  Why Create Works But Update Fails

  Both create and update have the same codegen issue (body?: never), but:
  1. Create operations might be working due to different handling in the generated client code
  2. Update operations fail because they're more strictly typed or handled differently
  3. The error "MatchError at PUT /api/games/2/locations/1" suggests the server isn't receiving the expected request body

  Recommended Fix

  The issue is in the OpenAPI code generator configuration or the generator itself. The codegen needs to consistently parse request body parameters
  marked as "in": "body" in the OpenAPI schema and generate the correct TypeScript types.

  This affects multiple entity types (locations, characters, factions, quests) but not others (notes, games), suggesting the parser has issues with
  certain endpoint patterns or parameter naming conventions.
