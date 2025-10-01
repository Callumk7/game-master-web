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
			// Create the path parameter based on source entity type
			const pathParam = {
				game_id: gameId,
				[`${sourceType}_id`]: sourceId,
				entity_type: targetType,
				entity_id: targetId,
			};

			const mutationMap = {
				character: updateCharacterLinkMutation(),
				faction: updateFactionLinkMutation(),
				location: updateLocationLinkMutation(),
				note: updateNoteLinkMutation(),
				quest: updateQuestLinkMutation(),
			};

			const mutation = mutationMap[sourceType];
			if (!mutation.mutationFn) {
				throw new Error(`Unsupported entity type: ${sourceType}`);
			}

			return mutation.mutationFn({
				path: pathParam as any,
				body: data,
			});
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