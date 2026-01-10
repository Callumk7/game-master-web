export const creationToolLinkConfig = {
	createCharacter: {
		to: "/games/$gameId/characters/$id",
		label: "Open character",
	},
	createFaction: {
		to: "/games/$gameId/factions/$id",
		label: "Open faction",
	},
	createLocation: {
		to: "/games/$gameId/locations/$id",
		label: "Open location",
	},
	createQuest: {
		to: "/games/$gameId/quests/$id",
		label: "Open quest",
	},
	createNote: {
		to: "/games/$gameId/notes/$id",
		label: "Open note",
	},
} as const;

export type CreationToolName = keyof typeof creationToolLinkConfig;
