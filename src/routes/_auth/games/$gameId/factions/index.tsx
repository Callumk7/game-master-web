import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { listFactionsOptions } from "~/api/@tanstack/react-query.gen";
import { FactionsTable } from "~/components/factions/factions-table";
import { PageHeader } from "~/components/page-header";
import { useListFactionsSuspenseQuery } from "~/queries/factions";

export const Route = createFileRoute("/_auth/games/$gameId/factions/")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			listFactionsOptions({ path: { game_id: params.gameId } }),
		);
	},
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	const { data, isLoading } = useListFactionsSuspenseQuery(gameId);
	const [searchQuery, setSearchQuery] = useState("");
	const [tagFilter, setTagFilter] = useState("");
	const [paginationSize, setPaginationSize] = useState(10);
	const navigate = useNavigate();

	const factions = data?.data || [];

	if (isLoading) {
		return <div className="text-muted-foreground">Loading factions...</div>;
	}

	const handleCreate = () => {
		navigate({ to: "/games/$gameId/factions/new", params: { gameId } });
	};

	return (
		<div className="container mx-auto py-8">
			<PageHeader
				title="All Factions"
				description="Browse all factions in your game."
				handleCreate={handleCreate}
			/>
			<FactionsTable
				gameId={gameId}
				data={factions}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				tagFilter={tagFilter}
				onTagFilterChange={setTagFilter}
				paginationSize={paginationSize}
				onPaginationSizeChange={setPaginationSize}
			/>
		</div>
	);
}
