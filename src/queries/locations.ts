import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {
	deleteLocationMutation,
	getLocationOptions,
	getLocationQueryKey,
	getLocationTreeOptions,
	getLocationTreeQueryKey,
	listGameEntitiesQueryKey,
	listLocationsOptions,
	listLocationsQueryKey,
	updateLocationMutation,
} from "~/api/@tanstack/react-query.gen";
import { useEntityTabs } from "~/components/entity-tabs";

////////////////////////////////////////////////////////////////////////////////
//                                QUERIES
////////////////////////////////////////////////////////////////////////////////

export const useListLocationsSuspenseQuery = (gameId: string) => {
	return useSuspenseQuery(listLocationsOptions({ path: { game_id: gameId } }));
};

export const useLocationSuspenseQuery = (gameId: string, id: string) => {
	return useSuspenseQuery(getLocationOptions({ path: { game_id: gameId, id } }));
};

export const useGetLocationTreeSuspenseQuery = (gameId: string) => {
	return useSuspenseQuery(getLocationTreeOptions({ path: { game_id: gameId } }));
};

////////////////////////////////////////////////////////////////////////////////
//                                MUTATIONS
////////////////////////////////////////////////////////////////////////////////

export const useDeleteLocationMutation = (gameId: string, locationId: string) => {
	const client = useQueryClient();
	const { removeTab } = useEntityTabs();
	return useMutation({
		...deleteLocationMutation(),
		onSuccess: () => {
			client.invalidateQueries({
				queryKey: listLocationsQueryKey({
					path: { game_id: gameId },
				}),
			});
			client.invalidateQueries({
				queryKey: listGameEntitiesQueryKey({
					path: { game_id: gameId },
				}),
			});
			client.invalidateQueries({
				queryKey: getLocationTreeQueryKey({
					path: { game_id: gameId },
				}),
			});
			client.removeQueries({
				queryKey: getLocationQueryKey({
					path: { game_id: gameId, id: locationId },
				}),
			});
			removeTab(locationId);
		},
	});
};

export const useUpdateLocationMutation = (gameId: string, locationId: string) => {
	const client = useQueryClient();
	return useMutation({
		...updateLocationMutation(),
		onSuccess: () => {
			client.invalidateQueries({
				queryKey: getLocationQueryKey({
					path: { game_id: gameId, id: locationId },
				}),
			});
		},
	});
};
