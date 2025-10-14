import { createFileRoute } from "@tanstack/react-router";
import { getQuestTreeOptions } from "~/api/@tanstack/react-query.gen";
import { Container } from "~/components/container";
import { QuestTreeView } from "~/components/quests/quest-tree-view";

export const Route = createFileRoute("/_auth/games/$gameId/quests/tree")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			getQuestTreeOptions({
				path: { game_id: params.gameId },
			}),
		);
	},
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	return (
		<Container>
			<QuestTreeView gameId={gameId} />
		</Container>
	);
}
