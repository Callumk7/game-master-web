import { createFileRoute } from "@tanstack/react-router";
import {
	getFactionLinksOptions,
	getFactionOptions,
} from "~/api/@tanstack/react-query.gen";
import { useAddTab } from "~/components/entity-tabs";
import { FactionDetail } from "~/components/factions/faction-detail";
import { useFactionQuery } from "~/queries/factions";

export const Route = createFileRoute("/_auth/games/$gameId/factions/$id/")({
	component: RouteComponent,
	loader: ({ context, params }) => {
		context.queryClient.ensureQueryData(
			getFactionOptions({
				path: {
					game_id: params.gameId,
					id: params.id,
				},
			}),
		);
		context.queryClient.ensureQueryData(
			getFactionLinksOptions({
				path: {
					game_id: params.gameId,
					faction_id: params.id,
				},
			}),
		);
	},
});

function RouteComponent() {
	const params = Route.useParams();
	const { gameId, id } = params;
	const { data } = useFactionQuery(gameId, id);

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
