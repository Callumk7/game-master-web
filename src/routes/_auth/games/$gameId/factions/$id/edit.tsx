import { createFileRoute } from "@tanstack/react-router";
import { getFactionOptions } from "~/api/@tanstack/react-query.gen";
import { EditFactionForm } from "~/components/factions/EditFactionForm";
import { useFactionQuery } from "~/queries/factions";

export const Route = createFileRoute("/_auth/games/$gameId/factions/$id/edit")({
	component: RouteComponent,
	loader: ({ context, params }) => {
		context.queryClient.ensureQueryData(
			getFactionOptions({
				path: { game_id: params.gameId, id: params.id },
			}),
		);
	},
});

function RouteComponent() {
	const { gameId, id } = Route.useParams();
	const { data } = useFactionQuery(gameId, id);
	return (
		<div>
			<EditFactionForm initialData={data.data} />
		</div>
	);
}
