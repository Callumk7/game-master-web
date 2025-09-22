import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import {
	createCharacterMutation,
	listCharactersQueryKey,
} from "~/api/@tanstack/react-query.gen";
import { createSmartForm } from "~/components/forms/smart-factory";
import { schemas } from "~/components/forms/type-utils";

export function CreateCharacterForm() {
	const { gameId } = useParams({ from: "/_auth/games/$gameId" });
	const queryClient = useQueryClient();

	const FormComponent = createSmartForm({
		mutation: () =>
			createCharacterMutation({
				path: { game_id: gameId },
			}),
		schema: schemas.character,
		entityName: "character",
		onSuccess: async () => {
			toast("Character created successfully!");
			await queryClient.refetchQueries({
				queryKey: listCharactersQueryKey({
					path: { game_id: gameId },
				}),
			});
		},
	});

	return <FormComponent />;
}
