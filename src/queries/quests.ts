import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	deleteQuestMutation,
	getQuestOptions,
	getQuestQueryKey,
	getQuestTreeOptions,
	listQuestsOptions,
	listQuestsQueryKey,
	updateQuestMutation,
} from "~/api/@tanstack/react-query.gen";

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

////////////////////////////////////////////////////////////////////////////////
//                                MUTATIONS
////////////////////////////////////////////////////////////////////////////////

export const useDeleteQuestMutation = (gameId: string) => {
	const navigate = useNavigate();
	const client = useQueryClient();
	return useMutation({
		...deleteQuestMutation(),
		onSuccess: () => {
			client.invalidateQueries({
				queryKey: listQuestsQueryKey({
					path: { game_id: gameId },
				}),
			});
			navigate({ to: ".." });
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
