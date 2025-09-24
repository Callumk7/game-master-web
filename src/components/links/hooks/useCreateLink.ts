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
			// Create the path parameter based on source entity type
			const pathParam = {
				game_id: gameId,
				[`${sourceType}_id`]: sourceId,
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
				body: {
					entity_type,
					entity_id,
					relationship_type,
					description,
					metadata,
					is_active,
					strength,
				} as LinkRequest,
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
