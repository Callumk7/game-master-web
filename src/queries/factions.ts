import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {
	deleteFactionMutation,
	getFactionLinksOptions,
	getFactionOptions,
	getFactionQueryKey,
	listFactionsOptions,
	listFactionsQueryKey,
	listGameEntitiesQueryKey,
	updateFactionMutation,
	useGetFactionLinksQuery,
} from "~/api/@tanstack/react-query.gen";
import { useUIActions } from "~/state/ui";

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
//                                PROCESSED
////////////////////////////////////////////////////////////////////////////////

export const useGetFactionNotesQuery = (gameId: string, factionId: string) => {
	const { data, status, error, isLoading, isError, isSuccess } =
		useGetFactionLinksQuery({
			path: { game_id: gameId, faction_id: factionId },
		});

	const notes = data?.data?.links?.notes || [];
	return { notes, status, error, isLoading, isError, isSuccess };
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

export const useDeleteFactionMutation = (gameId: string, factionId: string) => {
	const client = useQueryClient();
	const { removeTab } = useUIActions();
	return useMutation({
		...deleteFactionMutation(),
		onSuccess: () => {
			client.invalidateQueries({
				queryKey: listFactionsQueryKey({
					path: { game_id: gameId },
				}),
			});
			client.invalidateQueries({
				queryKey: listGameEntitiesQueryKey({
					path: { game_id: gameId },
				}),
			});
			client.removeQueries({
				queryKey: getFactionQueryKey({
					path: { game_id: gameId, id: factionId },
				}),
			});
			removeTab(factionId);
		},
	});
};
