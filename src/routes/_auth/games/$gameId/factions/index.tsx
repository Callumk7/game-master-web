import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { createColumns } from "~/components/factions/columns";
import { FactionsTable } from "~/components/factions/FactionsTable";
import { useListFactionsQuery } from "~/queries/factions";

export const Route = createFileRoute("/_auth/games/$gameId/factions/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	const { data, isLoading } = useListFactionsQuery(gameId);
	const [searchQuery, setSearchQuery] = useState("");
	const [tagFilter, setTagFilter] = useState("");

	const factions = data?.data || [];

	if (isLoading) {
		return <div className="text-muted-foreground">Loading factions...</div>;
	}
	const columns = createColumns(gameId);

	return (
		<div className="space-y-4">
			<FactionsTable
				columns={columns}
				data={factions}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				tagFilter={tagFilter}
				onTagFilterChange={setTagFilter}
			/>
		</div>
	);
}
