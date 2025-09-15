import { useNavigate, useParams, useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";
import { createQuestMutation } from "~/api/@tanstack/react-query.gen";
import { createSmartForm } from "../forms/smart-factory";
import { schemas } from "../forms/type-utils";

export function CreateQuestFormV2() {
	const { gameId } = useParams({ from: "/_auth/games/$gameId/quests/new" });
	const context = useRouteContext({ from: "/_auth/games/$gameId/quests/new" });
	const navigate = useNavigate();

	const FormComponent = createSmartForm({
		mutation: () => createQuestMutation({ path: { game_id: gameId } }),
		schema: schemas.quest,
		entityName: "quest",
		onSuccess: async () => {
			toast("Quest created successfully!");
			await context.queryClient.refetchQueries({
				queryKey: ["listQuests", { path: { game_id: gameId } }],
			});
			navigate({ to: ".." });
		},
	});

	return <FormComponent />;
}
