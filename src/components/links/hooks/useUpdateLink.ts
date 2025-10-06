import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	updateCharacterLinkMutation,
	updateFactionLinkMutation,
	updateLocationLinkMutation,
	updateNoteLinkMutation,
	updateQuestLinkMutation,
} from "~/api/@tanstack/react-query.gen";
import type { UpdateLinkParams } from "../types";

export function useUpdateLink(onSuccess?: () => void, onError?: (error: Error) => void) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			gameId,
			sourceType,
			sourceId,
			targetType,
			targetId,
			data,
		}: UpdateLinkParams) => {
			switch (sourceType) {
				case "character": {
					const path = {
						game_id: gameId,
						character_id: sourceId,
						entity_type: targetType,
						entity_id: targetId,
					};
					const mutation = updateCharacterLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Character link mutation not available");
					}
					return mutation.mutationFn({ path, body: data });
				}
				case "faction": {
					const path = {
						game_id: gameId,
						faction_id: sourceId,
						entity_type: targetType,
						entity_id: targetId,
					};
					const mutation = updateFactionLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Faction link mutation not available");
					}
					return mutation.mutationFn({ path, body: data });
				}
				case "location": {
					const path = {
						game_id: gameId,
						location_id: sourceId,
						entity_type: targetType,
						entity_id: targetId,
					};
					const mutation = updateLocationLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Location link mutation not available");
					}
					return mutation.mutationFn({ path, body: data });
				}
				case "note": {
					const path = {
						game_id: gameId,
						note_id: sourceId,
						entity_type: targetType,
						entity_id: targetId,
					};
					const mutation = updateNoteLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Note link mutation not available");
					}
					return mutation.mutationFn({ path, body: data });
				}
				case "quest": {
					const path = {
						game_id: gameId,
						quest_id: sourceId,
						entity_type: targetType,
						entity_id: targetId,
					};
					const mutation = updateQuestLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Quest link mutation not available");
					}
					return mutation.mutationFn({ path, body: data });
				}
				default:
					throw new Error(`Unsupported entity type: ${sourceType}`);
			}
		},
		onSuccess: () => {
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
