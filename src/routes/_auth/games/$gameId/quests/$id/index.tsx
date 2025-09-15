import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getQuestOptions } from "~/api/@tanstack/react-query.gen";
import { QuestDetail } from "~/components/quests/QuestDetail";

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

export const useQuestQuery = (gameId: string, id: string) => {
	return useSuspenseQuery({
		...getQuestOptions({
			path: { game_id: gameId, id },
		}),
	});
};
