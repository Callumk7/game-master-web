import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAddTab } from "~/components/entity-tabs";
import { LocationView } from "~/components/locations/location-view";
import { useLocationSuspenseQuery } from "~/queries/locations";

export const Route = createFileRoute("/_auth/games/$gameId/locations/$id/")({
	component: RouteComponent,
});

function RouteComponent() {
	const params = Route.useParams();
	const { gameId, id } = params;
	const { data } = useLocationSuspenseQuery(gameId, id);
	const location = data?.data;

	useAddTab({
		data: location,
		entityType: "location",
		gameId,
	});

	if (!location) {
		return <Navigate to=".." />;
	}

	return <LocationView location={location} gameId={gameId} />;
}
