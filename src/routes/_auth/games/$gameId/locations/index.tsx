import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { listLocationsOptions } from "~/api/@tanstack/react-query.gen";
import { EntityHeader } from "~/components/EntityHeader";
import { createColumns } from "~/components/locations/columns";
import { LocationsTable } from "~/components/locations/LocationsTable";

export const Route = createFileRoute("/_auth/games/$gameId/locations/")({
	component: RouteComponent,
	loader: ({ params, context }) => {
		return context.queryClient.ensureQueryData(
			listLocationsOptions({ path: { game_id: params.gameId } }),
		);
	},
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	const { data, isLoading } = useListLocationsQuery(gameId);
	const [searchQuery, setSearchQuery] = useState("");
	const [tagFilter, setTagFilter] = useState("");

	const locations = data?.data || [];

	if (isLoading) {
		return <div className="text-muted-foreground">Loading locations...</div>;
	}
	const columns = createColumns(gameId);

	const navigate = Route.useNavigate();

	const handleCreateNew = () => {
		navigate({ to: "new" });
	};

	return (
		<div className="space-y-4">
			<EntityHeader
				icon="🗺"
				title="Locations"
				count={locations.length}
				entityType="location"
				onCreateNew={handleCreateNew}
			/>

			<LocationsTable
				columns={columns}
				data={locations}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				tagFilter={tagFilter}
				onTagFilterChange={setTagFilter}
			/>
		</div>
	);
}

const useListLocationsQuery = (gameId: string) => {
	return useSuspenseQuery({ ...listLocationsOptions({ path: { game_id: gameId } }) });
};
