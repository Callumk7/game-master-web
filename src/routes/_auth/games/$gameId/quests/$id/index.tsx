import { createFileRoute } from "@tanstack/react-router";
import { getQuestOptions } from "~/api/@tanstack/react-query.gen";
import { QuestDetail } from "~/components/quests/QuestDetail";
import { useQuestQuery } from "~/queries/quests";

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
	const { gameId, id } = Route.useParams();
	const { data } = useQuestQuery(gameId, id);

	if (!data?.data) {
		return <div>Quest not found</div>;
	}

	return (
		<div>
			<QuestDetail quest={data.data} gameId={gameId} />
		</div>
	);
}
