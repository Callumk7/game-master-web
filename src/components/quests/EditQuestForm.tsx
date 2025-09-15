import { useParams, useRouteContext } from "@tanstack/react-router";
import {
	getQuestQueryKey,
	listQuestsQueryKey,
	updateQuestMutation,
} from "~/api/@tanstack/react-query.gen";
import type { QuestParams } from "~/api/types.gen";
import { createSmartForm } from "../forms/smart-factory";
import { schemas } from "../forms/type-utils";

interface EditQuestFormProps {
	initialData?: Partial<QuestParams>;
}

export function EditQuestForm({ initialData }: EditQuestFormProps) {
	const { gameId, id } = useParams({ from: "/_auth/games/$gameId/quests/$id/edit" });
	const context = useRouteContext({ from: "/_auth/games/$gameId/quests/$id/edit" });

	const FormWithContext = createSmartForm({
		mutation: () =>
			updateQuestMutation({
				path: {
					game_id: gameId,
					id,
				},
			}),
		onSuccess: async () => {
			context.queryClient.invalidateQueries({
				queryKey: listQuestsQueryKey({
					path: { game_id: gameId },
				}),
			});
			context.queryClient.invalidateQueries({
				queryKey: getQuestQueryKey({
					path: {
						game_id: gameId,
						id,
					},
				}),
			});
		},
		schema: schemas.quest,
		initialValues: initialData,
		entityName: "quest",
	});

	return <FormWithContext />;
}
