import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createCharacterLinkMutation,
	createFactionLinkMutation,
	createLocationLinkMutation,
	createNoteLinkMutation,
	createQuestLinkMutation,
} from "~/api/@tanstack/react-query.gen";
import type { CreateLinkParams } from "../types";

export function useCreateLink(onSuccess?: () => void, onError?: (error: Error) => void) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			gameId,
			sourceType,
			sourceId,
			targetType,
			targetId,
		}: CreateLinkParams) => {
			// For UUIDs, no validation needed - they're already strings

			// Create the path parameter based on source entity type
			const pathParam = {
				game_id: gameId,
				[`${sourceType}_id`]: sourceId,
			};

			// Create the query parameter for the target entity
			const queryParam = {
				entity_type: targetType,
				entity_id: targetId,
			};

			// Select the appropriate mutation based on source type
			const mutationMap = {
				character: createCharacterLinkMutation(),
				faction: createFactionLinkMutation(),
				location: createLocationLinkMutation(),
				note: createNoteLinkMutation(),
				quest: createQuestLinkMutation(),
			};

			const mutation = mutationMap[sourceType];
			if (!mutation.mutationFn) {
				throw new Error(`Unsupported entity type: ${sourceType}`);
			}

			return mutation.mutationFn({
				path: pathParam as any,
				query: queryParam,
			});
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
