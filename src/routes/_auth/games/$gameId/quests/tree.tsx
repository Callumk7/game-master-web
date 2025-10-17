import { createFileRoute } from "@tanstack/react-router";
import { getQuestTreeOptions } from "~/api/@tanstack/react-query.gen";
import { Container } from "~/components/container";
import { QuestTabs } from "~/components/quests/quest-tabs";
import { QuestTreeView } from "~/components/quests/quest-tree-view";
import { useGetQuestTreeSuspenseQuery } from "~/queries/quests";

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
	const { data: questTreeResponse } = useGetQuestTreeSuspenseQuery(gameId);
	return (
		<Container>
			<QuestTabs gameId={gameId} className="mb-4" />
			<QuestTreeView gameId={gameId} questTreeResponse={questTreeResponse} />
		</Container>
	);
}
