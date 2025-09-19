import { createFileRoute } from "@tanstack/react-router";
import {
	getFactionLinksOptions,
	getFactionOptions,
} from "~/api/@tanstack/react-query.gen";
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
	const { gameId, id } = Route.useParams();
	const { data } = useFactionQuery(gameId, id);

	if (!data?.data) {
		return <div>Faction not found</div>;
	}

	return (
		<div>
			<FactionDetail faction={data.data} gameId={gameId} />
		</div>
	);
}
