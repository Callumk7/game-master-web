import { useNavigate, useParams, useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";
import {
	createFactionMutation,
	listFactionsQueryKey,
} from "~/api/@tanstack/react-query.gen";
import { createSmartForm } from "~/components/forms/smart-factory";
import { schemas } from "../forms/type-utils";

export function CreateFactionForm() {
	const { gameId } = useParams({ from: "/_auth/games/$gameId/factions" });
	const context = useRouteContext({
		from: "/_auth/games/$gameId/factions",
	});
	const navigate = useNavigate();

	const FormComponent = createSmartForm({
		mutation: () =>
			createFactionMutation({
				path: { game_id: gameId },
			}),
		schema: schemas.faction,
		entityName: "faction",
		onSuccess: async () => {
			toast("Faction created successfully!");
			await context.queryClient.refetchQueries({
				queryKey: listFactionsQueryKey({
					path: { game_id: gameId },
				}),
			});
			navigate({ to: ".." });
		},
	});

	return <FormComponent />;
}
