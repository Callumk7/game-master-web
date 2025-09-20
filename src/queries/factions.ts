import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	deleteFactionMutation,
	getFactionLinksOptions,
	getFactionOptions,
	getFactionQueryKey,
	listFactionsOptions,
	listFactionsQueryKey,
	updateFactionMutation,
} from "~/api/@tanstack/react-query.gen";

////////////////////////////////////////////////////////////////////////////////
//                                QUERIES
////////////////////////////////////////////////////////////////////////////////

export const useListFactionsQuery = (gameId: string) => {
	return useQuery({ ...listFactionsOptions({ path: { game_id: gameId } }) });
};

export const useFactionQuery = (gameId: string, id: string) => {
	return useSuspenseQuery({
		...getFactionOptions({
			path: { game_id: gameId, id },
		}),
	});
};

export const useGetFactionLinks = (gameId: string, factionId: string) => {
	return useSuspenseQuery({
		...getFactionLinksOptions({
			path: { game_id: gameId, faction_id: factionId },
		}),
	});
};

////////////////////////////////////////////////////////////////////////////////
//                                MUTATIONS
////////////////////////////////////////////////////////////////////////////////

export const useUpdateFactionMutation = (gameId: string, factionId: string) => {
	const client = useQueryClient();
	return useMutation({
		...updateFactionMutation(),
		onSuccess: () => {
			client.invalidateQueries({
				queryKey: getFactionQueryKey({
					path: { game_id: gameId, id: factionId },
				}),
			});
		},
	});
};

export const useDeleteFactionMutation = (gameId: string) => {
	const navigate = useNavigate();
	const client = useQueryClient();
	return useMutation({
		...deleteFactionMutation(),
		onSuccess: () => {
			client.invalidateQueries({
				queryKey: listFactionsQueryKey({
					path: { game_id: gameId },
				}),
			});
			navigate({ to: ".." });
		},
	});
};
