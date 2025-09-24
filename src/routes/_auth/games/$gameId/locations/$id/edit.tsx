import { createFileRoute } from "@tanstack/react-router";
import { getLocationOptions } from "~/api/@tanstack/react-query.gen";
import { EditLocationForm } from "~/components/locations/edit-location-form";
import { useLocationQuery } from ".";

export const Route = createFileRoute("/_auth/games/$gameId/locations/$id/edit")({
	component: RouteComponent,
	loader: ({ context, params }) => {
		context.queryClient.ensureQueryData(
			getLocationOptions({
				path: { game_id: params.gameId, id: params.id },
			}),
		);
	},
});

function RouteComponent() {
	const { gameId, id } = Route.useParams();
	const { data } = useLocationQuery(gameId, id);
	return (
		<div>
			<EditLocationForm initialData={data.data} />
		</div>
	);
}
