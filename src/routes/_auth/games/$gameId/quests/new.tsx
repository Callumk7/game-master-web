import { createFileRoute } from "@tanstack/react-router";
import { CreateQuestForm } from "~/components/quests/create-quest-form";

export const Route = createFileRoute("/_auth/games/$gameId/quests/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<CreateQuestForm />
		</div>
	);
}
