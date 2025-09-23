import { createFileRoute } from "@tanstack/react-router";
import { getQuestOptions } from "~/api/@tanstack/react-query.gen";
import { useAddTab } from "~/components/entity-tabs";
import { QuestDetail } from "~/components/quests/quest-detail";
import { useGetQuestSuspenseQuery } from "~/queries/quests";

export const Route = createFileRoute("/_auth/games/$gameId/quests/$id/")({
	component: RouteComponent,
	loader: ({ context, params }) => {
		context.queryClient.ensureQueryData(
			getQuestOptions({
				path: {
					game_id: params.gameId,
					id: params.id,
				},
			}),
		);
	},
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
