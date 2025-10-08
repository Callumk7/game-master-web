import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {
	deleteQuestMutation,
	getQuestOptions,
	getQuestQueryKey,
	getQuestTreeOptions,
	getQuestTreeQueryKey,
	listGameEntitiesQueryKey,
	listPinnedEntitiesOptions,
	listQuestsOptions,
	listQuestsQueryKey,
	updateQuestMutation,
} from "~/api/@tanstack/react-query.gen";
import { useEntityTabs } from "~/components/entity-tabs";

////////////////////////////////////////////////////////////////////////////////
//                                QUERIES
////////////////////////////////////////////////////////////////////////////////

export const useListQuestsSuspenseQuery = (gameId: string) => {
	return useSuspenseQuery(listQuestsOptions({ path: { game_id: gameId } }));
};

export const useGetQuestSuspenseQuery = (gameId: string, id: string) => {
	return useSuspenseQuery(getQuestOptions({ path: { game_id: gameId, id } }));
};

export const useGetQuestTreeSuspenseQuery = (gameId: string) => {
	return useSuspenseQuery(getQuestTreeOptions({ path: { game_id: gameId } }));
};

export const useListPinnedEntitiesSuspenseQuery = (gameId: string) => {
	return useSuspenseQuery(listPinnedEntitiesOptions({ path: { game_id: gameId } }));
};

////////////////////////////////////////////////////////////////////////////////
//                                MUTATIONS
////////////////////////////////////////////////////////////////////////////////

export const useDeleteQuestMutation = (gameId: string, questId: string) => {
	const client = useQueryClient();
	const { removeTab } = useEntityTabs();
	return useMutation({
		...deleteQuestMutation(),
		onSuccess: () => {
			client.invalidateQueries({
				queryKey: listQuestsQueryKey({
					path: { game_id: gameId },
				}),
			});
			client.invalidateQueries({
				queryKey: listGameEntitiesQueryKey({
					path: { game_id: gameId },
				}),
			});
			client.invalidateQueries({
				queryKey: getQuestQueryKey({
					path: { game_id: gameId, id: questId },
				}),
			});
			client.removeQueries({
				queryKey: getQuestTreeQueryKey({
					path: { game_id: gameId },
				}),
			});
			removeTab(questId);
		},
	});
};

export const useUpdateQuestMutation = (gameId: string, questId: string) => {
	const client = useQueryClient();
	return useMutation({
		...updateQuestMutation(),
		onSuccess: () => {
			client.invalidateQueries({
				queryKey: getQuestQueryKey({
					path: { game_id: gameId, id: questId },
				}),
			});
		},
	});
};
