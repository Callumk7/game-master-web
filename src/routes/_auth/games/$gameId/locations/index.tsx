import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MapIcon } from "lucide-react";
import { listLocationsOptions } from "~/api/@tanstack/react-query.gen";
import { Container } from "~/components/container";
import { LocationTabs } from "~/components/locations/location-tabs";
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
	const navigate = useNavigate();

	const locations = data?.data || [];

	const handleCreate = () => {
		navigate({ to: "/games/$gameId/locations/new", params: { gameId } });
	};

	return (
		<Container>
			<LocationTabs gameId={gameId} className="mb-4" />
			<PageHeader
				title="All Locations"
				description="Browse all locations in your game."
				handleCreate={handleCreate}
				Icon={MapIcon}
			/>
			<LocationsTable gameId={gameId} data={locations} />
		</Container>
	);
}
