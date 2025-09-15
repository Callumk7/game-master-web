import { createFileRoute } from "@tanstack/react-router";
import { CreateQuestForm } from "~/components/quests/CreateQuestForm";

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
