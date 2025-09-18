import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { EntityHeader } from "~/components/EntityHeader";
import { createColumns } from "~/components/factions/columns";
import { FactionsTable } from "~/components/factions/FactionsTable";
import { useListFactionsQuery } from "~/queries/factions";

export const Route = createFileRoute("/_auth/games/$gameId/factions/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	const { data } = useListFactionsQuery(gameId);
	const [searchQuery, setSearchQuery] = useState("");
	const [tagFilter, setTagFilter] = useState("");

	const factions = data.data || [];
	const columns = createColumns(gameId);

	const navigate = Route.useNavigate();

	const handleCreateNew = () => {
		navigate({ to: "new" });
	};

	return (
		<div className="space-y-4">
			<EntityHeader
				icon="⚔"
				title="Factions"
				count={factions.length}
				entityType="faction"
				onCreateNew={handleCreateNew}
			/>

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
