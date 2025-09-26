import { createFileRoute } from "@tanstack/react-router";
import { getLocationOptions, useGetLocationQuery } from "~/api/@tanstack/react-query.gen";
import { EditLocationForm } from "~/components/locations/edit-location-form";

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
	const { data, isLoading, isSuccess } = useGetLocationQuery({
		path: { game_id: gameId, id: id },
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return <div>{isSuccess && <EditLocationForm initialData={data.data} />}</div>;
}
