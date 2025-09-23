import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getLocationOptions } from "~/api/@tanstack/react-query.gen";
import { useAddTab } from "~/components/entity-tabs";
import { BasicErrorComponent } from "~/components/error";
import { LocationDetail } from "~/components/locations/location-detail";

export const Route = createFileRoute("/_auth/games/$gameId/locations/$id/")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			getLocationOptions({
				path: { game_id: params.gameId, id: params.id },
			}),
		);
		context.queryClient.ensureQueryData(
			getLocationOptions({
				path: { game_id: params.gameId, id: params.id },
			}),
		);
	},
	errorComponent: BasicErrorComponent,
});

function RouteComponent() {
	const params = Route.useParams();
	const { gameId, id } = params;
	const { data } = useLocationQuery(gameId, id);

	useAddTab({
		id,
		label: data?.data?.name ?? "Character",
		path: Route.fullPath,
		params,
	});

	if (!data?.data) {
		return <div>Location not found</div>;
	}

	return <LocationDetail location={data.data} gameId={gameId} />;
}

export const useLocationQuery = (gameId: string, id: string) => {
	return useSuspenseQuery({ ...getLocationOptions({ path: { game_id: gameId, id } }) });
};
