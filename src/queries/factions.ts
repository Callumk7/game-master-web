import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
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

export const useListFactionsSuspenseQuery = (gameId: string) => {
	return useSuspenseQuery(
		listFactionsOptions({
			path: { game_id: gameId },
		}),
	);
};

export const useFactionSuspenseQuery = (gameId: string, id: string) => {
	return useSuspenseQuery(
		getFactionOptions({
			path: { game_id: gameId, id },
		}),
	);
};

export const useGetFactionLinksSuspenseQuery = (gameId: string, factionId: string) => {
	return useSuspenseQuery(
		getFactionLinksOptions({
			path: { game_id: gameId, faction_id: factionId },
		}),
	);
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
	const client = useQueryClient();
	return useMutation({
		...deleteFactionMutation(),
		onSuccess: () => {
			client.invalidateQueries({
				queryKey: listFactionsQueryKey({
					path: { game_id: gameId },
				}),
			});
		},
	});
};
