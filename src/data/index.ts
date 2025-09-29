import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import type { useQueryClient } from "@tanstack/react-query";
import type { z } from "zod";
import { updateCharacter } from "~/api";
import { listCharactersOptions } from "~/api/@tanstack/react-query.gen";
import { zCharacter } from "~/api/zod.gen";

// Infer the character type from the Zod schema
export type Character = z.infer<typeof zCharacter>;

export const charactersCollection = (
	gameId: string,
	queryClient: ReturnType<typeof useQueryClient>,
) => {
	const queryOptions = listCharactersOptions({ path: { game_id: gameId } });

	return createCollection(
		queryCollectionOptions({
			id: `characters-${gameId}`, // Unique ID for debugging
			queryKey: ["characters"],
			queryFn: async (context) => {
				try {
					const response = await queryOptions.queryFn!(context);
					// Handle the API response structure - it has a data wrapper
					const characters = response.data ?? [];
					return characters;
				} catch (error) {
					console.error("Failed to fetch characters:", error);
					// Return empty array on error to prevent collection from breaking
					return [];
				}
			},
			getKey: (character: Character) => character.id,
			onUpdate: async ({ transaction }) => {
				try {
					const { original, modified } = transaction.mutations[0];
					await updateCharacter({
						path: { game_id: gameId, id: original.id },
						body: { character: modified },
					});
				} catch (error) {
					console.error("Failed to update character:", error);
					// Re-throw to let TanStack DB handle the error
					throw error;
				}
			},
			schema: zCharacter,
			queryClient,
			startSync: true, // Explicitly start sync
			gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
		}),
	);
};
