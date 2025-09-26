import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { listLocationsOptions } from "~/api/@tanstack/react-query.gen";
import { LocationsTable } from "~/components/locations/locations-table";
import { PageHeader } from "~/components/page-header";
import { useListLocationsSuspenseQuery } from "~/queries/locations";

export const Route = createFileRoute("/_auth/games/$gameId/locations/")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			listLocationsOptions({ path: { game_id: params.gameId } }),
		);
	},
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	const { data } = useListLocationsSuspenseQuery(gameId);
	const [searchQuery, setSearchQuery] = useState("");
	const [tagFilter, setTagFilter] = useState("");
	const navigate = useNavigate();

	const locations = data?.data || [];

	const handleCreate = () => {
		navigate({ to: "/games/$gameId/locations/new", params: { gameId } });
	};

	return (
		<div className="container mx-auto py-8">
			<PageHeader
				title="All Locations"
				description="Browse all locations in your game."
				handleCreate={handleCreate}
			/>
			<LocationsTable
				gameId={gameId}
				data={locations}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				tagFilter={tagFilter}
				onTagFilterChange={setTagFilter}
			/>
		</div>
	);
}
