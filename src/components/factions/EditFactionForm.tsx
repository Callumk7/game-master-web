import { useParams, useRouteContext } from "@tanstack/react-router";
import {
	getFactionQueryKey,
	listFactionsQueryKey,
	updateFactionMutation,
} from "~/api/@tanstack/react-query.gen";
import type { FactionParams } from "~/api/types.gen";
import { createSmartForm } from "../forms/smart-factory";
import { schemas } from "../forms/type-utils";

interface EditFactionFormProps {
	initialData?: Partial<FactionParams>;
}

export function EditFactionForm({ initialData }: EditFactionFormProps) {
	const { gameId, id } = useParams({ from: "/_auth/games/$gameId/factions/$id/edit" });
	const context = useRouteContext({ from: "/_auth/games/$gameId/factions/$id/edit" });

	const FormWithContext = createSmartForm({
		mutation: () =>
			updateFactionMutation({
				path: {
					game_id: gameId,
					id: id,
				},
			}),

		onSuccess: async () => {
			context.queryClient.invalidateQueries({
				queryKey: listFactionsQueryKey({
					path: { game_id: gameId },
				}),
			});
			context.queryClient.invalidateQueries({
				queryKey: getFactionQueryKey({
					path: {
						game_id: gameId,
						id: id,
					},
				}),
			});
		},
		schema: schemas.faction,
		initialValues: initialData,
		entityName: "faction",
	});

	return <FormWithContext />;
}

