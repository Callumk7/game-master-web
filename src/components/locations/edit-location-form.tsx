import { useParams, useRouteContext } from "@tanstack/react-router";
import type { LocationUpdateParams } from "~/api";
import {
	getLocationQueryKey,
	listLocationsQueryKey,
	updateLocationMutation,
} from "~/api/@tanstack/react-query.gen";
import { createSmartForm } from "../forms/smart-factory";
import { schemas } from "../forms/type-utils";

interface EditLocationFormProps {
	initialData?: Partial<LocationUpdateParams>;
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
		onSuccess: () => {
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
