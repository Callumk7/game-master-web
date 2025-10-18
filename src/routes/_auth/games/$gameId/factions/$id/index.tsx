import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAddTab } from "~/components/entity-tabs";
import { FactionView } from "~/components/factions/faction-view";
import { useFactionSuspenseQuery } from "~/queries/factions";

export const Route = createFileRoute("/_auth/games/$gameId/factions/$id/")({
	component: RouteComponent,
});

function RouteComponent() {
	const params = Route.useParams();
	const { gameId, id } = params;
	const { data } = useFactionSuspenseQuery(gameId, id);
	const faction = data?.data;

	useAddTab({
		data: faction,
		entityType: "faction",
		gameId,
	});

	if (!faction) {
		return <Navigate to=".." />;
	}

	return <FactionView faction={faction} gameId={gameId} />;
}
