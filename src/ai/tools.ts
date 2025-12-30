/**
 * AI SDK Tools for accessing game entity data
 *
 * These tools allow an LLM to retrieve information about game entities
 * (characters, quests, locations, factions, notes) and their relationships.
 *
 * Context:
 * - The gameId is automatically provided via experimental_context
 * - The API client is configured with the user's bearer token in the chat API route
 * - See src/routes/api/chat.ts for the auth and context setup
 *
 * Available tools:
 * - Character tools: getCharacter, listCharacters, getCharacterLinks
 * - Quest tools: getQuest, listQuests, getQuestLinks
 * - Location tools: getLocation, listLocations, getLocationLinks
 * - Faction tools: getFaction, listFactions, getFactionLinks
 * - Note tools: getNote, listNotes, getNoteLinks
 */
import { tool } from "ai";
import z from "zod";
import {
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
			characterId: z.string().describe("The ID of the character to retrieve"),
		}),
		execute: async ({ characterId }, { experimental_context }) => {
			const { gameId } = experimental_context as { gameId: string };
			const response = await getCharacter({
				path: { game_id: gameId, id: characterId },
			});
			return response.data?.data ?? null;
		},
	}),

	listCharacters: tool({
		description:
			"Get all characters in the current game with their basic information",
		inputSchema: z.object({}),
		execute: async (_input, { experimental_context }) => {
			const { gameId } = experimental_context as { gameId: string };
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
			characterId: z.string().describe("The ID of the character"),
		}),
		execute: async ({ characterId }, { experimental_context }) => {
			const { gameId } = experimental_context as { gameId: string };
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
			questId: z.string().describe("The ID of the quest to retrieve"),
		}),
		execute: async ({ questId }, { experimental_context }) => {
			const { gameId } = experimental_context as { gameId: string };
			const response = await getQuest({
				path: { game_id: gameId, id: questId },
			});
			return response.data?.data ?? null;
		},
	}),

	listQuests: tool({
		description: "Get all quests in the current game with their basic information",
		inputSchema: z.object({}),
		execute: async (_input, { experimental_context }) => {
			const { gameId } = experimental_context as { gameId: string };
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
			questId: z.string().describe("The ID of the quest"),
		}),
		execute: async ({ questId }, { experimental_context }) => {
			const { gameId } = experimental_context as { gameId: string };
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
			locationId: z.string().describe("The ID of the location to retrieve"),
		}),
		execute: async ({ locationId }, { experimental_context }) => {
			const { gameId } = experimental_context as { gameId: string };
			const response = await getLocation({
				path: { game_id: gameId, id: locationId },
			});
			return response.data?.data ?? null;
		},
	}),

	listLocations: tool({
		description: "Get all locations in the current game with their basic information",
		inputSchema: z.object({}),
		execute: async (_input, { experimental_context }) => {
			const { gameId } = experimental_context as { gameId: string };
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
			locationId: z.string().describe("The ID of the location"),
		}),
		execute: async ({ locationId }, { experimental_context }) => {
			const { gameId } = experimental_context as { gameId: string };
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
			factionId: z.string().describe("The ID of the faction to retrieve"),
		}),
		execute: async ({ factionId }, { experimental_context }) => {
			const { gameId } = experimental_context as { gameId: string };
			const response = await getFaction({
				path: { game_id: gameId, id: factionId },
			});
			return response.data?.data ?? null;
		},
	}),

	listFactions: tool({
		description: "Get all factions in the current game with their basic information",
		inputSchema: z.object({}),
		execute: async (_input, { experimental_context }) => {
			const { gameId } = experimental_context as { gameId: string };
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
			factionId: z.string().describe("The ID of the faction"),
		}),
		execute: async ({ factionId }, { experimental_context }) => {
			const { gameId } = experimental_context as { gameId: string };
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
			noteId: z.string().describe("The ID of the note to retrieve"),
		}),
		execute: async ({ noteId }, { experimental_context }) => {
			const { gameId } = experimental_context as { gameId: string };
			const response = await getNote({
				path: { game_id: gameId, id: noteId },
			});
			return response.data?.data ?? null;
		},
	}),

	listNotes: tool({
		description: "Get all notes in the current game with their basic information",
		inputSchema: z.object({}),
		execute: async (_input, { experimental_context }) => {
			const { gameId } = experimental_context as { gameId: string };
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
			noteId: z.string().describe("The ID of the note"),
		}),
		execute: async ({ noteId }, { experimental_context }) => {
			const { gameId } = experimental_context as { gameId: string };
			const response = await getNoteLinks({
				path: { game_id: gameId, note_id: noteId },
			});
			return response.data?.data?.links ?? null;
		},
	}),
};
