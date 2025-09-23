import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { listLocationsOptions } from "~/api/@tanstack/react-query.gen";
import { createColumns } from "~/components/locations/columns";
import { LocationsTable } from "~/components/locations/locations-table";
import { useListLocationsSuspenseQuery } from "~/queries/locations";

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
	const { data, isLoading } = useListLocationsSuspenseQuery(gameId);
	const [searchQuery, setSearchQuery] = useState("");
	const [tagFilter, setTagFilter] = useState("");

	const locations = data?.data || [];

	if (isLoading) {
		return <div className="text-muted-foreground">Loading locations...</div>;
	}
	const columns = createColumns(gameId);

	return (
		<div className="space-y-4">
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
