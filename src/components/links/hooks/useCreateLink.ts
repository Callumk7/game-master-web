import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createCharacterLinkMutation,
	createFactionLinkMutation,
	createLocationLinkMutation,
	createNoteLinkMutation,
	createQuestLinkMutation,
} from "~/api/@tanstack/react-query.gen";
import type { LinkRequest } from "~/api/types.gen";
import type { CreateLinkParams } from "../types";

export function useCreateLink(onSuccess?: () => void, onError?: (error: Error) => void) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			gameId,
			sourceType,
			sourceId,
			entity_type,
			entity_id,
			description,
			metadata,
			is_active,
			relationship_type,
			strength,
		}: CreateLinkParams) => {
			const body: LinkRequest = {
				entity_type,
				entity_id,
				relationship_type,
				description,
				metadata,
				is_active,
				strength,
			};

			switch (sourceType) {
				case "character": {
					const path = { game_id: gameId, character_id: sourceId };
					const mutation = createCharacterLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Character link mutation not available");
					}
					return mutation.mutationFn({ path, body });
				}
				case "faction": {
					const path = { game_id: gameId, faction_id: sourceId };
					const mutation = createFactionLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Faction link mutation not available");
					}
					return mutation.mutationFn({ path, body });
				}
				case "location": {
					const path = { game_id: gameId, location_id: sourceId };
					const mutation = createLocationLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Location link mutation not available");
					}
					return mutation.mutationFn({ path, body });
				}
				case "note": {
					const path = { game_id: gameId, note_id: sourceId };
					const mutation = createNoteLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Note link mutation not available");
					}
					return mutation.mutationFn({ path, body });
				}
				case "quest": {
					const path = { game_id: gameId, quest_id: sourceId };
					const mutation = createQuestLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Quest link mutation not available");
					}
					return mutation.mutationFn({ path, body });
				}
				default:
					throw new Error(`Unsupported entity type: ${sourceType}`);
			}
		},
		onSuccess: () => {
			// Invalidate relevant queries to refresh data
			queryClient.invalidateQueries({ queryKey: [{ _id: "listGameEntities" }] });
			queryClient.invalidateQueries({ queryKey: [{ _id: "getCharacterLinks" }] });
			queryClient.invalidateQueries({ queryKey: [{ _id: "getFactionLinks" }] });
			queryClient.invalidateQueries({ queryKey: [{ _id: "getLocationLinks" }] });
			queryClient.invalidateQueries({ queryKey: [{ _id: "getNoteLinks" }] });
			queryClient.invalidateQueries({ queryKey: [{ _id: "getQuestLinks" }] });
			onSuccess?.();
		},
		onError,
	});
}
