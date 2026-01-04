import { createHash, randomUUID } from "node:crypto";
import { tool } from "ai";
import z from "zod";
import {
	createCharacter,
	createFaction,
	createLocation,
	createNote,
	createObjective,
	createQuest,
	getCharacter,
	getCharacterLinks,
	getFaction,
	getFactionLinks,
	getLocation,
	getLocationLinks,
	getNote,
	getNoteLinks,
	getQuest,
	getQuestLinks,
	listCharacters,
	listFactions,
	listGameObjectives,
	listLocations,
	listNotes,
	listObjectives,
	listPinnedEntities,
	listQuests,
	searchGame,
} from "~/api/sdk.gen";

import type { Objective, SearchGameData } from "~/api/types.gen";

type EntityType = "character" | "quest" | "location" | "faction" | "note";

function normalizeContentForSnapshot(content: unknown): {
	contentString: string | null;
	contentJson: object | null;
} {
	if (content == null) {
		return { contentString: null, contentJson: null };
	}

	// Some API responses may already return TipTap JSON as an object
	if (typeof content === "object") {
		const obj = content as Record<string, unknown>;
		if ("type" in obj) {
			return {
				contentString: JSON.stringify(obj),
				contentJson: obj,
			};
		}
	}

	if (typeof content === "string") {
		try {
			const parsed = JSON.parse(content);
			if (parsed && typeof parsed === "object" && "type" in (parsed as object)) {
				return { contentString: content, contentJson: parsed as object };
			}
		} catch {
			// Not JSON; treat as plain text
		}

		return {
			contentString: content,
			contentJson: {
				type: "doc",
				content: [
					{
						type: "paragraph",
						content: [{ type: "text", text: content }],
					},
				],
			},
		};
	}

	// Unknown shape; ignore
	return { contentString: null, contentJson: null };
}

function hashEntitySnapshot(snapshot: Record<string, unknown>) {
	return createHash("sha256").update(JSON.stringify(snapshot)).digest("hex");
}

export const tools = {
	// Character tools
	getCharacter: tool({
		description:
			"Get detailed information about a specific character by ID, including their content, tags, and metadata",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
			characterId: z.string().describe("The ID of the character to retrieve"),
		}),
		execute: async ({ gameId, characterId }) => {
			const response = await getCharacter({
				path: { game_id: gameId, id: characterId },
			});
			return response.data?.data ?? null;
		},
	}),

	listCharacters: tool({
		description:
			"Get all characters in the current game with their basic information",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
		}),
		execute: async ({ gameId }) => {
			const response = await listCharacters({
				path: { game_id: gameId },
			});
			return response.data?.data ?? [];
		},
	}),

	getCharacterLinks: tool({
		description:
			"Get all entities (factions, locations, notes, quests, other characters) linked to a specific character",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
			characterId: z.string().describe("The ID of the character"),
		}),
		execute: async ({ gameId, characterId }) => {
			const response = await getCharacterLinks({
				path: { game_id: gameId, character_id: characterId },
			});
			return response.data?.data?.links ?? null;
		},
	}),

	// Quest tools
	getQuest: tool({
		description:
			"Get detailed information about a specific quest by ID, including content, status, and objectives",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
			questId: z.string().describe("The ID of the quest to retrieve"),
		}),
		execute: async ({ gameId, questId }) => {
			const response = await getQuest({
				path: { game_id: gameId, id: questId },
			});
			return response.data?.data ?? null;
		},
	}),

	listQuests: tool({
		description: "Get all quests in the current game with their basic information",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
		}),
		execute: async ({ gameId }) => {
			const response = await listQuests({
				path: { game_id: gameId },
			});
			return response.data?.data ?? [];
		},
	}),

	getQuestLinks: tool({
		description:
			"Get all entities (characters, factions, locations, notes) linked to a specific quest",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
			questId: z.string().describe("The ID of the quest"),
		}),
		execute: async ({ gameId, questId }) => {
			const response = await getQuestLinks({
				path: { game_id: gameId, quest_id: questId },
			});
			return response.data?.data?.links ?? null;
		},
	}),

	// Location tools
	getLocation: tool({
		description:
			"Get detailed information about a specific location by ID, including content, parent location, and metadata",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
			locationId: z.string().describe("The ID of the location to retrieve"),
		}),
		execute: async ({ gameId, locationId }) => {
			const response = await getLocation({
				path: { game_id: gameId, id: locationId },
			});
			return response.data?.data ?? null;
		},
	}),

	listLocations: tool({
		description: "Get all locations in the current game with their basic information",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
		}),
		execute: async ({ gameId }) => {
			const response = await listLocations({
				path: { game_id: gameId },
			});
			return response.data?.data ?? [];
		},
	}),

	getLocationLinks: tool({
		description:
			"Get all entities (characters, factions, notes, quests) linked to a specific location",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
			locationId: z.string().describe("The ID of the location"),
		}),
		execute: async ({ gameId, locationId }) => {
			const response = await getLocationLinks({
				path: { game_id: gameId, location_id: locationId },
			});
			return response.data?.data?.links ?? null;
		},
	}),

	// Faction tools
	getFaction: tool({
		description:
			"Get detailed information about a specific faction by ID, including content, goals, and metadata",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
			factionId: z.string().describe("The ID of the faction to retrieve"),
		}),
		execute: async ({ gameId, factionId }) => {
			const response = await getFaction({
				path: { game_id: gameId, id: factionId },
			});
			return response.data?.data ?? null;
		},
	}),

	listFactions: tool({
		description: "Get all factions in the current game with their basic information",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
		}),
		execute: async ({ gameId }) => {
			const response = await listFactions({
				path: { game_id: gameId },
			});
			return response.data?.data ?? [];
		},
	}),

	getFactionLinks: tool({
		description:
			"Get all entities (characters, locations, notes, quests) linked to a specific faction",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
			factionId: z.string().describe("The ID of the faction"),
		}),
		execute: async ({ gameId, factionId }) => {
			const response = await getFactionLinks({
				path: { game_id: gameId, faction_id: factionId },
			});
			return response.data?.data?.links ?? null;
		},
	}),

	// Note tools
	getNote: tool({
		description:
			"Get detailed information about a specific note by ID, including content and tags",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
			noteId: z.string().describe("The ID of the note to retrieve"),
		}),
		execute: async ({ gameId, noteId }) => {
			const response = await getNote({
				path: { game_id: gameId, id: noteId },
			});
			return response.data?.data ?? null;
		},
	}),

	listNotes: tool({
		description: "Get all notes in the current game with their basic information",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
		}),
		execute: async ({ gameId }) => {
			const response = await listNotes({
				path: { game_id: gameId },
			});
			return response.data?.data ?? [];
		},
	}),

	getNoteLinks: tool({
		description:
			"Get all entities (characters, factions, locations, quests, other notes) linked to a specific note",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
			noteId: z.string().describe("The ID of the note"),
		}),
		execute: async ({ gameId, noteId }) => {
			const response = await getNoteLinks({
				path: { game_id: gameId, note_id: noteId },
			});
			return response.data?.data?.links ?? null;
		},
	}),

	// Mutation tools - Entity Creation
	createCharacter: tool({
		description:
			"Create a new character in the game. Required: name, class, level. The content should be TipTap JSON format for rich text.",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
			name: z.string().describe("Character name (required)"),
			class: z
				.string()
				.describe(
					"Character class (required, e.g., 'Fighter', 'Wizard', 'Rogue')",
				),
			level: z
				.number()
				.int()
				.min(1)
				.describe("Character level (required, minimum 1)"),
			race: z
				.string()
				.optional()
				.describe("Character race (optional, e.g., 'Human', 'Elf', 'Dwarf')"),
			alive: z
				.boolean()
				.optional()
				.default(true)
				.describe("Whether the character is alive (defaults to true)"),
			content: z
				.object({})
				.passthrough()
				.optional()
				.describe(
					"Rich text content as TipTap JSON. Must have type='doc' and content array. Example: {type: 'doc', content: [{type: 'paragraph', content: [{type: 'text', text: 'Description here'}]}]}",
				),
			tags: z
				.array(z.string())
				.optional()
				.describe("Tags for organization (optional)"),
		}),
		execute: async ({
			gameId,
			name,
			class: charClass,
			level,
			race,
			alive,
			content,
			tags,
		}) => {
			try {
				const response = await createCharacter({
					path: { game_id: gameId },
					body: {
						character: {
							name,
							class: charClass,
							level,
							race,
							alive,
							content: content ? JSON.stringify(content) : undefined,
							tags,
						},
					},
				});

				if (response.error) {
					return {
						success: false,
						error: response.error,
					};
				}

				const character = response.data?.data;
				return {
					success: true,
					message: `Successfully created character "${name}" (Level ${level} ${race || ""} ${charClass})`,
					id: character?.id,
					character,
				};
			} catch (error) {
				return {
					success: false,
					error:
						error instanceof Error ? error.message : "Unknown error occurred",
				};
			}
		},
	}),

	createFaction: tool({
		description:
			"Create a new faction/organization in the game. Required: name. The content should be TipTap JSON format for rich text.",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
			name: z.string().describe("Faction name (required)"),
			content: z
				.object({})
				.passthrough()
				.optional()
				.describe(
					"Rich text content as TipTap JSON describing the faction. Example: {type: 'doc', content: [{type: 'paragraph', content: [{type: 'text', text: 'Faction description'}]}]}",
				),
			tags: z
				.array(z.string())
				.optional()
				.describe("Tags for organization (optional)"),
		}),
		execute: async ({ gameId, name, content, tags }) => {
			try {
				const response = await createFaction({
					path: { game_id: gameId },
					body: {
						faction: {
							name,
							content: content ? JSON.stringify(content) : undefined,
							tags,
						},
					},
				});

				if (response.error) {
					return {
						success: false,
						error: response.error,
					};
				}

				const faction = response.data?.data;
				return {
					success: true,
					message: `Successfully created faction "${name}"`,
					id: faction?.id,
					faction,
				};
			} catch (error) {
				return {
					success: false,
					error:
						error instanceof Error ? error.message : "Unknown error occurred",
				};
			}
		},
	}),

	createLocation: tool({
		description:
			"Create a new location in the game. Required: name, type. The content should be TipTap JSON format for rich text.",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
			name: z.string().describe("Location name (required)"),
			type: z
				.enum([
					"continent",
					"nation",
					"region",
					"city",
					"settlement",
					"building",
					"complex",
				])
				.describe(
					"Location type (required): continent, nation, region, city, settlement, building, or complex",
				),
			content: z
				.object({})
				.passthrough()
				.optional()
				.describe(
					"Rich text content as TipTap JSON describing the location. Example: {type: 'doc', content: [{type: 'paragraph', content: [{type: 'text', text: 'Location description'}]}]}",
				),
			parentId: z
				.string()
				.optional()
				.describe("Parent location ID for hierarchical structure (optional)"),
			tags: z
				.array(z.string())
				.optional()
				.describe("Tags for organization (optional)"),
		}),
		execute: async ({ gameId, name, type, content, parentId, tags }) => {
			try {
				const response = await createLocation({
					path: { game_id: gameId },
					body: {
						location: {
							name,
							type,
							content: content ? JSON.stringify(content) : undefined,
							parent_id: parentId,
							tags,
						},
					},
				});

				if (response.error) {
					return {
						success: false,
						error: response.error,
					};
				}

				const location = response.data?.data;
				return {
					success: true,
					message: `Successfully created ${type} "${name}"${parentId ? " (nested location)" : ""}`,
					id: location?.id,
					location,
				};
			} catch (error) {
				return {
					success: false,
					error:
						error instanceof Error ? error.message : "Unknown error occurred",
				};
			}
		},
	}),

	createQuest: tool({
		description:
			"Create a new quest in the game. Required: name. The content should be TipTap JSON format for rich text.",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
			name: z.string().describe("Quest name (required)"),
			content: z
				.object({})
				.passthrough()
				.optional()
				.describe(
					"Rich text content as TipTap JSON describing the quest. Example: {type: 'doc', content: [{type: 'paragraph', content: [{type: 'text', text: 'Quest description'}]}]}",
				),
			status: z
				.enum([
					"preparing",
					"ready",
					"active",
					"paused",
					"completed",
					"cancelled",
				])
				.optional()
				.describe(
					"Quest status (optional): preparing, ready, active, paused, completed, or cancelled. Defaults to 'preparing'.",
				),
			parentId: z
				.string()
				.optional()
				.describe("Parent quest ID for hierarchical structure (optional)"),
			tags: z
				.array(z.string())
				.optional()
				.describe("Tags for organization (optional)"),
		}),
		execute: async ({ gameId, name, content, status, parentId, tags }) => {
			try {
				const response = await createQuest({
					path: { game_id: gameId },
					body: {
						quest: {
							name,
							content: content ? JSON.stringify(content) : undefined,
							status,
							parent_id: parentId,
							tags,
						},
					},
				});

				if (response.error) {
					return {
						success: false,
						error: response.error,
					};
				}

				const quest = response.data?.data;
				return {
					success: true,
					message: `Successfully created quest "${name}"${status ? ` with status: ${status}` : ""}${parentId ? " (sub-quest)" : ""}`,
					id: quest?.id,
					quest,
				};
			} catch (error) {
				return {
					success: false,
					error:
						error instanceof Error ? error.message : "Unknown error occurred",
				};
			}
		},
	}),

	createNote: tool({
		description:
			"Create a new note in the game. Required: name. The content should be TipTap JSON format for rich text.",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
			name: z.string().describe("Note name/title (required)"),
			content: z
				.object({})
				.passthrough()
				.optional()
				.describe(
					"Rich text content as TipTap JSON. Example: {type: 'doc', content: [{type: 'paragraph', content: [{type: 'text', text: 'Note content'}]}]}",
				),
			tags: z
				.array(z.string())
				.optional()
				.describe("Tags for organization (optional)"),
		}),
		execute: async ({ gameId, name, content, tags }) => {
			try {
				const response = await createNote({
					path: { game_id: gameId },
					body: {
						note: {
							name,
							content: content ? JSON.stringify(content) : undefined,
							tags,
						},
					},
				});

				if (response.error) {
					return {
						success: false,
						error: response.error,
					};
				}

				const note = response.data?.data;
				return {
					success: true,
					message: `Successfully created note "${name}"`,
					id: note?.id,
					note,
				};
			} catch (error) {
				return {
					success: false,
					error:
						error instanceof Error ? error.message : "Unknown error occurred",
				};
			}
		},
	}),

	// Search tools
	searchGame: tool({
		description:
			"Search across characters, factions, locations, quests, and notes using keywords and optional filters to quickly surface relevant context",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
			query: z
				.string()
				.min(1)
				.describe("Search text applied to entity names and content"),
			entityTypes: z
				.array(z.enum(["character", "quest", "location", "faction", "note"]))
				.optional()
				.describe(
					"Optional list of entity types to search; omit to search all supported types",
				),
			tags: z
				.array(z.string().min(1))
				.optional()
				.describe("Optional list of tags; all tags must match"),
			pinnedOnly: z
				.boolean()
				.optional()
				.describe("Set true to only return entities that are currently pinned"),
			limit: z
				.number()
				.int()
				.min(1)
				.max(100)
				.optional()
				.describe("Maximum results per entity type (default 50, max 100)"),
			offset: z.number().int().min(0).optional().describe("Pagination offset"),
		}),
		execute: async ({
			gameId,
			query,
			entityTypes,
			tags,
			pinnedOnly,
			limit,
			offset,
		}) => {
			const queryParams: SearchGameData["query"] = {
				q: query,
			};

			if (entityTypes?.length) {
				queryParams.types = entityTypes.join(",");
			}

			if (tags?.length) {
				queryParams.tags = tags.join(",");
			}

			if (pinnedOnly !== undefined) {
				queryParams.pinned_only = pinnedOnly;
			}

			if (typeof limit === "number") {
				queryParams.limit = limit;
			}

			if (typeof offset === "number") {
				queryParams.offset = offset;
			}

			const response = await searchGame({
				path: { game_id: gameId },
				query: queryParams,
			});
			return response.data?.data ?? null;
		},
	}),

	// Session Planning Tools
	listPinnedEntities: tool({
		description:
			"Get all pinned entities (characters, quests, factions, locations, notes) that are marked as important by the GM. Pinned entities represent what's most relevant RIGHT NOW for session planning and active storylines.",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
		}),
		execute: async ({ gameId }) => {
			const response = await listPinnedEntities({
				path: { game_id: gameId },
			});
			return response.data?.data ?? null;
		},
	}),

	getActiveQuests: tool({
		description:
			"Get only quests with 'active' status - the current ongoing storylines. Use this instead of listQuests when you need to focus on what's happening NOW, excluding completed, cancelled, or preparing quests.",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
		}),
		execute: async ({ gameId }) => {
			const response = await listQuests({
				path: { game_id: gameId },
			});
			const allQuests = response.data?.data ?? [];
			// Filter to only active quests
			const activeQuests = allQuests.filter((quest) => quest.status === "active");
			return activeQuests;
		},
	}),

	listQuestObjectives: tool({
		description:
			"Get all objectives for a specific quest along with their completion status. Objectives are the individual tasks/goals within a quest. Use this to understand what's been completed and what remains to be done.",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
			questId: z.string().describe("The ID of the quest to get objectives for"),
		}),
		execute: async ({ gameId, questId }) => {
			try {
				const response = await listObjectives({
					path: { game_id: gameId, quest_id: questId },
				});
				return response.data?.data ?? [];
			} catch (error) {
				return {
					error:
						error instanceof Error
							? error.message
							: "Failed to fetch objectives",
					questId,
				};
			}
		},
	}),

	listAllObjectives: tool({
		description:
			"Get every quest objective in the game to review progress at a glance. Optionally filter to a specific quest or completion state.",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
			questId: z
				.string()
				.optional()
				.describe("If provided, only return objectives for this quest"),
			completed: z
				.boolean()
				.optional()
				.describe("Set true/false to filter by completion status"),
		}),
		execute: async ({ gameId, questId, completed }) => {
			const response = await listGameObjectives({
				path: { game_id: gameId },
			});
			const objectives = (response.data?.data ?? []) as Objective[];

			return objectives.filter((objective) => {
				if (questId && objective.quest_id !== questId) {
					return false;
				}
				if (completed !== undefined && objective.complete !== completed) {
					return false;
				}
				return true;
			});
		},
	}),

	createObjective: tool({
		description:
			"Create a new objective for a quest. Requires the quest ID and a description; you can optionally mark it complete or link a note.",
		inputSchema: z.object({
			gameId: z.string().describe("The ID of the game"),
			questId: z
				.string()
				.describe("The ID of the quest to attach the objective to"),
			description: z.string().min(1).describe("Objective description text"),
			complete: z
				.boolean()
				.optional()
				.describe("Whether the objective should start marked complete"),
			noteLinkId: z
				.string()
				.optional()
				.describe("Optional note link id to associate with the objective"),
		}),
		execute: async ({ gameId, questId, description, complete, noteLinkId }) => {
			try {
				const response = await createObjective({
					path: { game_id: gameId, quest_id: questId },
					body: {
						objective: {
							body: description,
							...(complete !== undefined ? { complete } : {}),
							...(noteLinkId ? { note_link_id: noteLinkId } : {}),
						},
					},
				});

				if (response.error) {
					return {
						success: false,
						error: response.error,
					};
				}

				const objective = response.data?.data;
				return {
					success: true,
					message: `Objective created for quest ${questId}`,
					objective,
				};
			} catch (error) {
				return {
					success: false,
					error:
						error instanceof Error ? error.message : "Unknown error occurred",
				};
			}
		},
	}),

	// Update proposals (approval required)
	//
	// IMPORTANT: This tool DOES NOT update anything. It only proposes a change and returns
	// a before/after snapshot that the UI can present for human approval.
	proposeEntityUpdate: tool({
		description:
			"Propose an update to an existing entity (character, quest, location, faction, note). This tool NEVER applies changes; it only returns a draft proposal for user approval.",
		inputSchema: z.discriminatedUnion("entityType", [
			z.object({
				gameId: z.string().describe("The ID of the game"),
				entityType: z.literal("character"),
				entityId: z.string().describe("The ID of the character to update"),
				// Common editable fields
				name: z.string().optional().describe("New character name (optional)"),
				tags: z.array(z.string()).optional().describe("New tags (optional)"),
				// Content is TipTap JSON
				content: z
					.object({})
					.passthrough()
					.optional()
					.describe("New rich text content as TipTap JSON (optional)"),
				content_plain_text: z
					.string()
					.optional()
					.describe("Plain text version of content (optional)"),
				// Character-specific
				alive: z.boolean().optional().describe("Whether the character is alive"),
				class: z.string().optional().describe("Character class"),
				level: z.number().int().min(1).optional().describe("Character level"),
				race: z.string().optional().describe("Character race"),
			}),
			z.object({
				gameId: z.string().describe("The ID of the game"),
				entityType: z.literal("quest"),
				entityId: z.string().describe("The ID of the quest to update"),
				name: z.string().optional().describe("New quest name (optional)"),
				tags: z.array(z.string()).optional().describe("New tags (optional)"),
				content: z.object({}).passthrough().optional(),
				content_plain_text: z.string().optional(),
				parent_id: z
					.string()
					.optional()
					.describe("Parent quest ID for hierarchical structure (optional)"),
				status: z
					.enum([
						"preparing",
						"ready",
						"active",
						"paused",
						"completed",
						"cancelled",
					])
					.optional()
					.describe("Quest status (optional)"),
			}),
			z.object({
				gameId: z.string().describe("The ID of the game"),
				entityType: z.literal("location"),
				entityId: z.string().describe("The ID of the location to update"),
				name: z.string().optional().describe("New location name (optional)"),
				tags: z.array(z.string()).optional().describe("New tags (optional)"),
				content: z.object({}).passthrough().optional(),
				content_plain_text: z.string().optional(),
				parent_id: z
					.string()
					.optional()
					.describe("Parent location ID (optional)"),
				type: z
					.enum([
						"continent",
						"nation",
						"region",
						"city",
						"settlement",
						"building",
						"complex",
					])
					.optional()
					.describe("Location type (optional)"),
			}),
			z.object({
				gameId: z.string().describe("The ID of the game"),
				entityType: z.literal("faction"),
				entityId: z.string().describe("The ID of the faction to update"),
				name: z.string().optional().describe("New faction name (optional)"),
				tags: z.array(z.string()).optional().describe("New tags (optional)"),
				content: z.object({}).passthrough().optional(),
				content_plain_text: z.string().optional(),
			}),
			z.object({
				gameId: z.string().describe("The ID of the game"),
				entityType: z.literal("note"),
				entityId: z.string().describe("The ID of the note to update"),
				name: z.string().optional().describe("New note name (optional)"),
				tags: z.array(z.string()).optional().describe("New tags (optional)"),
				content: z.object({}).passthrough().optional(),
				content_plain_text: z.string().optional(),
			}),
		]),
		execute: async (input) => {
			const { gameId } = input;
			const entityType: EntityType = input.entityType;
			const entityId = input.entityId;

			const changeId = randomUUID();

			// Fetch current entity
			const current = await (async () => {
				switch (entityType) {
					case "character": {
						const res = await getCharacter({
							path: { game_id: gameId, id: entityId },
						});
						return res.data?.data ?? null;
					}
					case "quest": {
						const res = await getQuest({
							path: { game_id: gameId, id: entityId },
						});
						return res.data?.data ?? null;
					}
					case "location": {
						const res = await getLocation({
							path: { game_id: gameId, id: entityId },
						});
						return res.data?.data ?? null;
					}
					case "faction": {
						const res = await getFaction({
							path: { game_id: gameId, id: entityId },
						});
						return res.data?.data ?? null;
					}
					case "note": {
						const res = await getNote({
							path: { game_id: gameId, id: entityId },
						});
						return res.data?.data ?? null;
					}
				}
			})();

			if (!current) {
				return {
					success: false,
					error: `Entity not found: ${entityType} ${entityId}`,
				};
			}

			const currentRecord = current as Record<string, unknown>;
			const get = <T>(key: string): T | null => {
				const value = currentRecord[key];
				return value === undefined ? null : (value as T);
			};

			const normalizedContent = normalizeContentForSnapshot(currentRecord.content);

			// Build a normalized snapshot to hash for conflict detection.
			const beforeSnapshot = {
				name: get<string>("name"),
				tags: get<Array<string>>("tags"),
				content: normalizedContent.contentString,
				content_plain_text: get<string>("content_plain_text"),
				// entity-specific (included so changes in these fields are detected as conflicts)
				alive: get<boolean>("alive"),
				class: get<string>("class"),
				level: get<number>("level"),
				race: get<string>("race"),
				status: get<string>("status"),
				parent_id: get<string>("parent_id"),
				type: get<string>("type"),
			};
			const beforeHash = hashEntitySnapshot(beforeSnapshot);

			const beforeContentJson = normalizedContent.contentJson;

			const proposedContentJson =
				"content" in input && input.content ? input.content : beforeContentJson;

			return {
				success: true,
				changeId,
				gameId,
				entityType,
				entityId,
				beforeHash,
				before: {
					...beforeSnapshot,
					content_json: beforeContentJson,
				},
				proposed: {
					// Only include fields the user/model intends to change.
					...(input.name !== undefined ? { name: input.name } : {}),
					...(input.tags !== undefined ? { tags: input.tags } : {}),
					...("content" in input && input.content !== undefined
						? { content_json: input.content }
						: { content_json: proposedContentJson }),
					...("content_plain_text" in input &&
					input.content_plain_text !== undefined
						? { content_plain_text: input.content_plain_text }
						: {}),
					...("alive" in input && input.alive !== undefined
						? { alive: input.alive }
						: {}),
					...("class" in input && input.class !== undefined
						? { class: input.class }
						: {}),
					...("level" in input && input.level !== undefined
						? { level: input.level }
						: {}),
					...("race" in input && input.race !== undefined
						? { race: input.race }
						: {}),
					...("status" in input && input.status !== undefined
						? { status: input.status }
						: {}),
					...("parent_id" in input && input.parent_id !== undefined
						? { parent_id: input.parent_id }
						: {}),
					...("type" in input && input.type !== undefined
						? { type: input.type }
						: {}),
				},
				// Explicit reminder for the UI/model
				approvalRequired: true,
				message:
					"Draft proposal created. Please review the changes in the editor and click Approve to apply, or adjust before approving.",
			};
		},
	}),
};
