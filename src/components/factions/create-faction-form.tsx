import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import {
	createFactionMutation,
	listFactionsQueryKey,
} from "~/api/@tanstack/react-query.gen";
import { createSmartForm } from "~/components/forms/smart-factory";
import { schemas } from "../forms/type-utils";

export function CreateFactionForm() {
	const { gameId } = useParams({ from: "/_auth/games/$gameId" });
	const queryClient = useQueryClient();

	const FormComponent = createSmartForm({
		mutation: () =>
			createFactionMutation({
				path: { game_id: gameId },
			}),
		schema: schemas.faction,
		entityName: "faction",
		onSuccess: async () => {
			toast("Faction created successfully!");
			await queryClient.refetchQueries({
				queryKey: listFactionsQueryKey({
					path: { game_id: gameId },
				}),
			});
		},
	});

	return <FormComponent />;
}
