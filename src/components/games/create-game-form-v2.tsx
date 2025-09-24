import { useRouteContext } from "@tanstack/react-router";
import { z } from "zod";
import type { GameParams } from "~/api";
import { createGameMutation, listGamesQueryKey } from "~/api/@tanstack/react-query.gen";
import { createFormComponent } from "~/components/forms/factory-v2";

// Schema for validation
const gameSchema = z.object({
	name: z.string().min(1, "Game name is required"),
	description: z.string().optional(),
	setting: z.string().optional(),
});

// Field configuration
const gameFields = [
	{
		name: "name",
		label: "Game Name",
		type: "text" as const,
		placeholder: "Enter game name",
		required: true,
	},
	{
		name: "description",
		label: "Game Description",
		type: "textarea" as const,
		placeholder: "Describe your game...",
		description: "Optional description of your game",
	},
	{
		name: "setting",
		label: "Game Setting",
		type: "text" as const,
		placeholder: "e.g., Fantasy, Sci-Fi, Modern...",
		description: "The world or setting your game takes place in",
	},
];

export function CreateGameFormV2() {
	const context = useRouteContext({ from: "/_auth/games" });

	// We need to handle the query invalidation through context
	// The factory will handle the mutation, but we need to customize the success handler
	const FormWithContext = createFormComponent({
		mutationOptions: () => {
			const baseMutation = createGameMutation();
			return {
				...baseMutation,
				onSuccess: () => {
					context.queryClient.invalidateQueries({
						queryKey: listGamesQueryKey(),
					});
				},
			};
		},
		schema: gameSchema,
		fields: gameFields,
		defaultValues: {
			name: "",
			description: "",
			setting: "",
		} satisfies GameParams,
		className: "max-w-md mx-auto bg-card p-6 rounded-lg shadow-md",
		entityName: "game",
	});

	return <FormWithContext />;
}
