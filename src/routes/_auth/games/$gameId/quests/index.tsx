import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { listQuestsOptions } from "~/api/@tanstack/react-query.gen";
import { createColumns } from "~/components/quests/columns";
import { QuestsTable } from "~/components/quests/quests-table";
import { useListQuestsSuspenseQuery } from "~/queries/quests";

export const Route = createFileRoute("/_auth/games/$gameId/quests/")({
	component: RouteComponent,
	loader: ({ params, context }) => {
		return context.queryClient.ensureQueryData(
			listQuestsOptions({ path: { game_id: params.gameId } }),
		);
	},
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	const { data, isLoading } = useListQuestsSuspenseQuery(gameId);
	const [searchQuery, setSearchQuery] = useState("");
	const [tagFilter, setTagFilter] = useState("");

	const quests = data?.data || [];

	if (isLoading) {
		return <div className="text-muted-foreground">Loading quests...</div>;
	}
	const columns = createColumns(gameId);

	return (
		<div className="space-y-4">
			<QuestsTable
				columns={columns}
				data={quests}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				tagFilter={tagFilter}
				onTagFilterChange={setTagFilter}
			/>
		</div>
	);
}
