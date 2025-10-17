import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Gem } from "lucide-react";
import { listQuestsOptions } from "~/api/@tanstack/react-query.gen";
import { Container } from "~/components/container";
import { PageHeader } from "~/components/page-header";
import { QuestTabs } from "~/components/quests/quest-tabs";
import { QuestsTable } from "~/components/quests/quests-table";
import { useListQuestsSuspenseQuery } from "~/queries/quests";

export const Route = createFileRoute("/_auth/games/$gameId/quests/")({
	component: RouteComponent,
	loader: async ({ params, context }) => {
		await context.queryClient.ensureQueryData(
			listQuestsOptions({ path: { game_id: params.gameId } }),
		);
	},
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	const { data, isLoading } = useListQuestsSuspenseQuery(gameId);
	const navigate = useNavigate();

	const quests = data?.data || [];

	if (isLoading) {
		return <div className="text-muted-foreground">Loading quests...</div>;
	}

	const handleCreate = () => {
		navigate({ to: "/games/$gameId/quests/new", params: { gameId } });
	};

	return (
		<Container>
			<QuestTabs gameId={gameId} className="mb-4" />
			<PageHeader
				title="All Quests"
				description="Browse all quests in your game."
				Icon={Gem}
				handleCreate={handleCreate}
			/>
			<QuestsTable gameId={gameId} data={quests} />
		</Container>
	);
}
