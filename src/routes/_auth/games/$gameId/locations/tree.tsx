import { createFileRoute } from "@tanstack/react-router";
import { getLocationTreeOptions } from "~/api/@tanstack/react-query.gen";
import { Container } from "~/components/container";
import { LocationTreeView } from "~/components/locations/location-tree-view";

export const Route = createFileRoute("/_auth/games/$gameId/locations/tree")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			getLocationTreeOptions({ path: { game_id: params.gameId } }),
		);
	},
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	return (
		<Container>
			<LocationTreeView gameId={gameId} />
		</Container>
	);
}
