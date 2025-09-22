import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getLocationOptions } from "~/api/@tanstack/react-query.gen";
import { LocationDetail } from "~/components/locations/location-detail";

export const Route = createFileRoute("/_auth/games/$gameId/locations/$id/")({
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

	if (!data?.data) {
		return <div>Location not found</div>;
	}

	return <LocationDetail location={data.data} gameId={gameId} />;
}

export const useLocationQuery = (gameId: string, id: string) => {
	return useSuspenseQuery({ ...getLocationOptions({ path: { game_id: gameId, id } }) });
};
