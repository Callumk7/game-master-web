import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { CharacterUpdateParams } from "~/api";
import {
	getCharacterQueryKey,
	listCharactersQueryKey,
	updateCharacterMutation,
} from "~/api/@tanstack/react-query.gen";
import { createSmartForm } from "../forms/smart-factory";
import { schemas } from "../forms/type-utils";

interface EditCharacterFormProps {
	params: {
		gameId: string;
		id: string;
	};
	initialData?: Partial<CharacterUpdateParams>;
}

export function EditCharacterForm({ initialData, params }: EditCharacterFormProps) {
	const { gameId, id } = params;
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	// Create form component with proper context handling
	const FormComponent = createSmartForm({
		mutation: () =>
			updateCharacterMutation({
				path: {
					game_id: gameId,
					id,
				},
			}),
		onSuccess: async () => {
			toast("Character updated successfully!");
			queryClient.invalidateQueries({
				queryKey: listCharactersQueryKey({
					path: { game_id: gameId },
				}),
			});
			queryClient.invalidateQueries({
				queryKey: getCharacterQueryKey({
					path: {
						game_id: gameId,
						id: id,
					},
				}),
			});
			navigate({ to: ".." });
		},
		schema: schemas.character,
		entityName: "character",
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
