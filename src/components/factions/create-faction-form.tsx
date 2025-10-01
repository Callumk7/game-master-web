import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import {
	createFactionMutation,
	listFactionsQueryKey,
} from "~/api/@tanstack/react-query.gen";
import { createSmartForm } from "~/components/forms/smart-factory";
import { schemas } from "../forms/type-utils";

interface CreateFactionFormProps {
	onSuccess?: () => void;
}

export function CreateFactionForm({ onSuccess }: CreateFactionFormProps) {
	const { gameId } = useParams({ from: "/_auth/games/$gameId" });
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const FormComponent = createSmartForm({
		mutation: () =>
			createFactionMutation({
				path: { game_id: gameId },
			}),
		schema: schemas.faction,
		entityName: "faction",
		onSuccess: async ({ data }) => {
			toast("Faction created successfully!");
			queryClient.invalidateQueries({
				queryKey: listFactionsQueryKey({
					path: { game_id: gameId },
				}),
			});

			if (onSuccess) {
				onSuccess();
			}

			if (data) {
				navigate({
					to: "/games/$gameId/factions/$id",
					params: { gameId, id: data.id },
				});
			}
		},
	});

	return <FormComponent />;
}
