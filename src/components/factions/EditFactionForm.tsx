import { useParams, useRouteContext } from "@tanstack/react-router";
import z from "zod";
import {
	getFactionQueryKey,
	listFactionsQueryKey,
	updateFactionMutation,
} from "~/api/@tanstack/react-query.gen";
import type { FactionParams } from "~/api/types.gen";
import { createFormComponent } from "../forms/factory-v2";

const factionSchema = z.object({
	name: z.string().min(1, "Faction name is required"),
	description: z.string().min(1, "Faction description is required"),
});

const factionFields = [
	{
		name: "name",
		label: "Faction Name",
		type: "text" as const,
		placeholder: "Enter faction name",
		required: true,
	},
	{
		name: "description",
		label: "Faction Description",
		type: "textarea" as const,
		placeholder: "Describe your faction...",
		required: true,
		description: "Optional description of your faction",
	},
];

interface EditFactionFormProps {
	initialData?: Partial<FactionParams>;
}

export function EditFactionForm({ initialData }: EditFactionFormProps) {
	const { gameId, id } = useParams({ from: "/_auth/games/$gameId/factions/$id/edit" });
	const context = useRouteContext({ from: "/_auth/games/$gameId/factions/$id/edit" });

	const FormWithContext = createFormComponent({
		mutationOptions: () => {
			const baseMutation = updateFactionMutation({
				path: {
					game_id: gameId,
					id: id,
				},
			});
			return {
				...baseMutation,
				onSuccess: () => {
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
			};
		},
		schema: factionSchema,
		fields: factionFields,
		defaultValues: {
			name: initialData?.name || "",
			description: initialData?.description || "",
		} satisfies FactionParams,
		entityName: "faction",
	});

	return <FormWithContext />;
}