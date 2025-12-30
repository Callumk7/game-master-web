import { tool } from "ai";
import z from "zod";
import {
	createCharacter,
	createFaction,
	createLocation,
	createNote,
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
	listLocations,
	listNotes,
	listQuests,
} from "~/api/sdk.gen";

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
};
