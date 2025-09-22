import { useNavigate, useParams, useRouteContext } from "@tanstack/react-router";
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
	initialData?: Partial<CharacterUpdateParams>;
}

export function EditCharacterForm({ initialData }: EditCharacterFormProps) {
	const { gameId, id } = useParams({
		from: "/_auth/games/$gameId/characters/$id/edit",
	});
	const context = useRouteContext({ from: "/_auth/games/$gameId/characters/$id/edit" });
	const navigate = useNavigate();

	// Create form component with proper context handling
	const FormComponent = createSmartForm({
		mutation: () =>
			updateCharacterMutation({
				path: {
					game_id: gameId,
					id: id,
				},
			}),
		onSuccess: async () => {
			toast("Character updated successfully!");
			context.queryClient.invalidateQueries({
				queryKey: listCharactersQueryKey({
					path: { game_id: gameId },
				}),
			});
			context.queryClient.invalidateQueries({
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
	});

	return <FormComponent />;
}
