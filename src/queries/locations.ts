import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	deleteLocationMutation,
	getLocationOptions,
	getLocationQueryKey,
	getLocationTreeOptions,
	listLocationsOptions,
	listLocationsQueryKey,
	updateLocationMutation,
} from "~/api/@tanstack/react-query.gen";

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

export const useDeleteLocationMutation = (gameId: string) => {
	const navigate = useNavigate();
	const client = useQueryClient();
	return useMutation({
		...deleteLocationMutation(),
		onSuccess: () => {
			client.invalidateQueries({
				queryKey: listLocationsQueryKey({
					path: { game_id: gameId },
				}),
			});
			navigate({ to: ".." });
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
