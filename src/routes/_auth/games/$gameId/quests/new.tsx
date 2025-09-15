import { createFileRoute } from "@tanstack/react-router";
import { CreateQuestFormV2 } from "~/components/quests/CreateQuestFormV2";

export const Route = createFileRoute("/_auth/games/$gameId/quests/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<CreateQuestFormV2 />
		</div>
	);
}
