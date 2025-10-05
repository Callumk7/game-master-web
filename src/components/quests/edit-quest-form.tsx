import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { QuestUpdateParams } from "~/api";
import {
	getQuestQueryKey,
	listQuestsQueryKey,
	updateQuestMutation,
} from "~/api/@tanstack/react-query.gen";
import { createSmartForm, schemas } from "~/lib/smart-form-factory";

interface EditQuestFormProps {
	params: {
		gameId: string;
		id: string;
	};
	initialData?: Partial<QuestUpdateParams>;
}

export function EditQuestForm({ initialData, params }: EditQuestFormProps) {
	const { gameId, id } = params;
	const queryClient = useQueryClient();

	const FormComponent = createSmartForm({
		mutation: () =>
			updateQuestMutation({
				path: {
					game_id: gameId,
					id,
				},
			}),
		onSuccess: async () => {
			toast("Quest updated successfully!");
			queryClient.invalidateQueries({
				queryKey: listQuestsQueryKey({
					path: { game_id: gameId },
				}),
			});
			queryClient.invalidateQueries({
				queryKey: getQuestQueryKey({
					path: {
						game_id: gameId,
						id: id,
					},
				}),
			});
		},
		schema: schemas.quest,
		entityName: "quest",
		initialValues: {
			...initialData,
		},
		fieldOverrides: {
			content: null,
		},
	});

	return <FormComponent />;
}
