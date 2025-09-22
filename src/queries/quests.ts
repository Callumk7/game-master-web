import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	deleteQuestMutation,
	getQuestLinksOptions,
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

export const useListQuestsQuery = (gameId: string) => {
	return useQuery({ ...listQuestsOptions({ path: { game_id: gameId } }) });
};

export const useQuestQuery = (gameId: string, id: string) => {
	return useSuspenseQuery({
		...getQuestOptions({ path: { game_id: gameId, id } }),
	});
};

export const useGetQuestLinks = (gameId: string, questId: string) => {
	return useQuery(
		getQuestLinksOptions({
			path: { game_id: gameId, quest_id: questId },
		}),
	);
};

export const useGetQuestTree = (gameId: string) => {
	return useQuery(getQuestTreeOptions({ path: { game_id: gameId } }));
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

