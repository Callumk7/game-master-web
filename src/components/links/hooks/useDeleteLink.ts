import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	deleteCharacterLinkMutation,
	deleteFactionLinkMutation,
	deleteLocationLinkMutation,
	deleteNoteLinkMutation,
	deleteQuestLinkMutation,
} from "~/api/@tanstack/react-query.gen";
import type { DeleteLinkParams } from "../types";

export function useDeleteLink(onSuccess?: () => void, onError?: (error: Error) => void) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			gameId,
			sourceType,
			sourceId,
			targetType,
			targetId,
		}: DeleteLinkParams) => {
			console.log(targetType, targetId);
			console.log(sourceType, sourceId);

			switch (sourceType) {
				case "character": {
					const path = {
						game_id: gameId,
						character_id: sourceId,
						entity_type: targetType,
						entity_id: targetId,
					};
					const mutation = deleteCharacterLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Character link mutation not available");
					}
					return mutation.mutationFn({ path });
				}
				case "faction": {
					const path = {
						game_id: gameId,
						faction_id: sourceId,
						entity_type: targetType,
						entity_id: targetId,
					};
					const mutation = deleteFactionLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Faction link mutation not available");
					}
					return mutation.mutationFn({ path });
				}
				case "location": {
					const path = {
						game_id: gameId,
						location_id: sourceId,
						entity_type: targetType,
						entity_id: targetId,
					};
					const mutation = deleteLocationLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Location link mutation not available");
					}
					return mutation.mutationFn({ path });
				}
				case "note": {
					const path = {
						game_id: gameId,
						note_id: sourceId,
						entity_type: targetType,
						entity_id: targetId,
					};
					const mutation = deleteNoteLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Note link mutation not available");
					}
					return mutation.mutationFn({ path });
				}
				case "quest": {
					const path = {
						game_id: gameId,
						quest_id: sourceId,
						entity_type: targetType,
						entity_id: targetId,
					};
					const mutation = deleteQuestLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Quest link mutation not available");
					}
					return mutation.mutationFn({ path });
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
