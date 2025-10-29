import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CharacterUpdateParams } from "~/api";
import {
	getCharacterQueryKey,
	listCharactersQueryKey,
	updateCharacterMutation,
} from "~/api/@tanstack/react-query.gen";
import { createSmartForm, schemas } from "~/lib/smart-form-factory";
import { useUIActions } from "~/state/ui";

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
	const { setIsEditCharacterOpen } = useUIActions();

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
			toast.success("Character updated successfully!");
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
			setIsEditCharacterOpen(false);
		},
		schema: schemas.character.omit({ content: true }),
		entityName: "character",
		initialValues: {
			...initialData,
		},
	});

	return <FormComponent />;
}
