import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	deleteLocationMutation,
	getLocationLinksOptions,
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

export const useListLocationsQuery = (gameId: string) => {
	return useQuery({ ...listLocationsOptions({ path: { game_id: gameId } }) });
};

export const useLocationQuery = (gameId: string, id: string) => {
	return useSuspenseQuery({
		...getLocationOptions({ path: { game_id: gameId, id } }),
	});
};

export const useGetLocationLinks = (gameId: string, locationId: string) => {
	return useQuery(
		getLocationLinksOptions({
			path: { game_id: gameId, location_id: locationId },
		}),
	);
};

export const useGetLocationTree = (gameId: string) => {
	return useQuery(getLocationTreeOptions({ path: { game_id: gameId } }));
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

