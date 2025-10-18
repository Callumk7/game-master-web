import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAddTab } from "~/components/entity-tabs";
import { QuestView } from "~/components/quests/quest-view";
import { useGetQuestSuspenseQuery } from "~/queries/quests";

export const Route = createFileRoute("/_auth/games/$gameId/quests/$id/")({
	component: RouteComponent,
});

function RouteComponent() {
	const params = Route.useParams();
	const { gameId, id } = params;
	const { data } = useGetQuestSuspenseQuery(gameId, id);
	const quest = data?.data;

	useAddTab({
		data: quest,
		entityType: "quest",
		gameId,
	});

	if (!quest) {
		return <Navigate to=".." />;
	}

	return <QuestView quest={quest} gameId={gameId} />;
}
