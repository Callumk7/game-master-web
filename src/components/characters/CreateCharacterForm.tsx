import { useNavigate, useParams, useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";
import {
	createCharacterMutation,
	listCharactersQueryKey,
} from "~/api/@tanstack/react-query.gen";
import { createSmartForm } from "~/components/forms/smart-factory";
import { schemas } from "~/components/forms/type-utils";

export function CreateCharacterForm() {
	const { gameId } = useParams({ from: "/_auth/games/$gameId/characters" });
	const context = useRouteContext({ from: "/_auth/games/$gameId/characters" });
	const navigate = useNavigate();

	const FormComponent = createSmartForm({
		mutation: () =>
			createCharacterMutation({
				path: { game_id: gameId },
			}),
		schema: schemas.character,
		entityName: "character",
		onSuccess: async () => {
			toast("Character created successfully!");
			await context.queryClient.refetchQueries({
				queryKey: listCharactersQueryKey({
					path: { game_id: gameId },
				}),
			});
			navigate({ to: ".." });
		},
	});

	return <FormComponent />;
}
