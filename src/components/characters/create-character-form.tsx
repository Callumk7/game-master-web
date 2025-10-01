import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import {
	createCharacterMutation,
	listCharactersQueryKey,
	listGameEntitiesQueryKey,
} from "~/api/@tanstack/react-query.gen";
import { createSmartForm } from "~/components/forms/smart-factory";
import { schemas } from "~/components/forms/type-utils";

interface CreateCharacterFormProps {
	onSuccess?: () => void;
}

export function CreateCharacterForm({ onSuccess }: CreateCharacterFormProps) {
	const { gameId } = useParams({ from: "/_auth/games/$gameId" });
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const FormComponent = createSmartForm({
		mutation: () =>
			createCharacterMutation({
				path: { game_id: gameId },
			}),
		schema: schemas.character,
		entityName: "character",
		onSuccess: async ({ data }) => {
			toast("Character created successfully!");
			queryClient.invalidateQueries({
				queryKey: listCharactersQueryKey({
					path: { game_id: gameId },
				}),
			});
			queryClient.invalidateQueries({
				queryKey: listGameEntitiesQueryKey({
					path: { game_id: gameId },
				}),
			});

			if (onSuccess) {
				onSuccess();
			}

			if (data) {
				navigate({
					to: "/games/$gameId/characters/$id",
					params: { gameId, id: data.id },
				});
			}
		},
		fieldOverrides: {
			image_url: null,
		},
	});

	return <FormComponent />;
}
