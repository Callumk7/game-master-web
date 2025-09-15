import { useParams, useRouteContext } from "@tanstack/react-router";
import z from "zod";
import { createQuestMutation, listQuestsQueryKey } from "~/api/@tanstack/react-query.gen";
import type { QuestParams } from "~/api/types.gen";
import { createFormComponent } from "../forms/factory-v2";

const questSchema = z.object({
	name: z.string().min(1, "Quest name is required"),
	content: z.string().min(1, "Quest content is required"),
});

const questFields = [
	{
		name: "name",
		label: "Quest Name",
		type: "text" as const,
		placeholder: "Enter quest name",
		required: true,
	},
	{
		name: "content",
		label: "Quest Content",
		type: "textarea" as const,
		placeholder: "Describe the quest objectives, story, and requirements...",
		required: true,
		description: "Details about the quest objectives and story",
	},
];

export function CreateQuestForm() {
	const { gameId } = useParams({ from: "/_auth/games/$gameId/quests/new" });
	const context = useRouteContext({ from: "/_auth/games/$gameId/quests/new" });

	const FormWithContext = createFormComponent({
		mutationOptions: () => {
			const baseMutation = createQuestMutation({
				path: { game_id: gameId },
			});
			return {
				...baseMutation,
				onSuccess: () => {
					context.queryClient.invalidateQueries({
						queryKey: listQuestsQueryKey({
							path: { game_id: gameId },
						}),
					});
				},
			};
		},
		schema: questSchema,
		fields: questFields,
		defaultValues: {
			name: "",
			content: "",
		} satisfies QuestParams,
		entityName: "quest",
	});

	return <FormWithContext />;
}

