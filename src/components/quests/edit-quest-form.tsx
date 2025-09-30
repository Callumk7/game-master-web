import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { QuestUpdateParams } from "~/api";
import {
	getQuestQueryKey,
	listQuestsQueryKey,
	updateQuestMutation,
} from "~/api/@tanstack/react-query.gen";
import { createSmartForm } from "../forms/smart-factory";
import { schemas } from "../forms/type-utils";

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
	const navigate = useNavigate();

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
			navigate({ to: ".." });
		},
		schema: schemas.quest,
		entityName: "quest",
		initialValues: {
			...initialData,
			image_url: initialData?.image_url || undefined,
		},
		fieldOverrides: {
			content: null,
		},
	});

	return <FormComponent />;
}
