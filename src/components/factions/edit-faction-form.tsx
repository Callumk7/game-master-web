import { useQueryClient } from "@tanstack/react-query";
import type { Faction } from "~/api";
import {
	getFactionQueryKey,
	listFactionsQueryKey,
	updateFactionMutation,
} from "~/api/@tanstack/react-query.gen";
import { createSmartForm, schemas } from "~/lib/smart-form-factory";
import { useUIActions } from "~/state/ui";

interface EditFactionFormProps {
	params: {
		gameId: string;
		id: string;
	};
	initialData?: Partial<Faction>;
}

export function EditFactionForm({ initialData, params }: EditFactionFormProps) {
	const { gameId, id } = params;
	const queryClient = useQueryClient();
	const { setIsEditFactionOpen } = useUIActions();

	const FormWithContext = createSmartForm({
		mutation: () =>
			updateFactionMutation({
				path: {
					game_id: gameId,
					id: id,
				},
			}),

		onSuccess: async () => {
			queryClient.invalidateQueries({
				queryKey: listFactionsQueryKey({
					path: { game_id: gameId },
				}),
			});
			queryClient.invalidateQueries({
				queryKey: getFactionQueryKey({
					path: {
						game_id: gameId,
						id: id,
					},
				}),
			});
			setIsEditFactionOpen(false);
		},
		schema: schemas.faction,
		initialValues: initialData,
		entityName: "faction",
		fieldOverrides: {
			content: null,
		},
	});

	return <FormWithContext />;
}
