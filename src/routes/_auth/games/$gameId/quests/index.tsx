import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { listQuestsOptions } from "~/api/@tanstack/react-query.gen";
import { EntityHeader } from "~/components/EntityHeader";
import { createColumns } from "~/components/quests/columns";
import { QuestsTable } from "~/components/quests/QuestsTable";

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
	const { data, isLoading } = useListQuestsQuery(gameId);
	const [searchQuery, setSearchQuery] = useState("");
	const [tagFilter, setTagFilter] = useState("");

	const quests = data?.data || [];

	if (isLoading) {
		return <div className="text-muted-foreground">Loading quests...</div>;
	}
	const columns = createColumns(gameId);

	const navigate = Route.useNavigate();

	const handleCreateNew = () => {
		navigate({ to: "new" });
	};

	return (
		<div className="space-y-4">
			<EntityHeader
				icon="📋"
				title="Quests"
				count={quests.length}
				entityType="quest"
				onCreateNew={handleCreateNew}
			/>

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

const useListQuestsQuery = (gameId: string) => {
	return useSuspenseQuery({ ...listQuestsOptions({ path: { game_id: gameId } }) });
};
