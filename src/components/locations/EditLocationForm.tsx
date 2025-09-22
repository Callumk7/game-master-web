import { useParams, useRouteContext } from "@tanstack/react-router";
import {
	getLocationQueryKey,
	listLocationsQueryKey,
	updateLocationMutation,
} from "~/api/@tanstack/react-query.gen";
import type { LocationParams } from "~/api/types.gen";
import { createSmartForm } from "../forms/smart-factory";
import { schemas } from "../forms/type-utils";

interface EditLocationFormProps {
	initialData?: Partial<LocationParams>;
}

export function EditLocationForm({ initialData }: EditLocationFormProps) {
	const { gameId, id } = useParams({ from: "/_auth/games/$gameId/locations/$id/edit" });
	const context = useRouteContext({ from: "/_auth/games/$gameId/locations/$id/edit" });

	const FormWithContext = createSmartForm({
		mutation: () =>
			updateLocationMutation({
				path: {
					game_id: gameId,
					id: id,
				},
			}),
		onSuccess: async () => {
			context.queryClient.invalidateQueries({
				queryKey: listLocationsQueryKey({
					path: { game_id: gameId },
				}),
			});
			context.queryClient.invalidateQueries({
				queryKey: getLocationQueryKey({
					path: {
						game_id: gameId,
						id: id,
					},
				}),
			});
		},
		schema: schemas.location,
		initialValues: initialData,
		entityName: "location",
	});

	return <FormWithContext />;
}
