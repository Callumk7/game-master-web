import { createFileRoute } from "@tanstack/react-router";
import { useAddTab } from "~/components/entity-tabs";
import { FactionDetail } from "~/components/factions/faction-detail";
import { useFactionSuspenseQuery } from "~/queries/factions";

export const Route = createFileRoute("/_auth/games/$gameId/factions/$id/")({
	component: RouteComponent,
});

function RouteComponent() {
	const params = Route.useParams();
	const { gameId, id } = params;
	const { data } = useFactionSuspenseQuery(gameId, id);

	useAddTab({
		id,
		label: data?.data?.name ?? "Character",
		path: Route.fullPath,
		params,
	});

	if (!data?.data) {
		return <div>Faction not found</div>;
	}

	return (
		<div>
			<FactionDetail faction={data.data} gameId={gameId} />
		</div>
	);
}
