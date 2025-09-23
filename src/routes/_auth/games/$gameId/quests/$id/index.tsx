import { createFileRoute } from "@tanstack/react-router";
import { useAddTab } from "~/components/entity-tabs";
import { QuestDetail } from "~/components/quests/quest-detail";
import { useGetQuestSuspenseQuery } from "~/queries/quests";

export const Route = createFileRoute("/_auth/games/$gameId/quests/$id/")({
	component: RouteComponent,
});

function RouteComponent() {
	const params = Route.useParams();
	const { gameId, id } = params;
	const { data } = useGetQuestSuspenseQuery(gameId, id);

	useAddTab({
		id,
		label: data?.data?.name ?? "Character",
		path: Route.fullPath,
		params,
	});

	if (!data?.data) {
		return <div>Quest not found</div>;
	}

	return (
		<div>
			<QuestDetail quest={data.data} gameId={gameId} />
		</div>
	);
}
