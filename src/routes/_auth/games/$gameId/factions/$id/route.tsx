import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
	getFactionLinksOptions,
	getFactionOptions,
} from "~/api/@tanstack/react-query.gen";
import { BasicErrorComponent } from "~/components/error";

export const Route = createFileRoute("/_auth/games/$gameId/factions/$id")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			getFactionOptions({
				path: { game_id: params.gameId, id: params.id },
			}),
		);
		context.queryClient.ensureQueryData(
			getFactionLinksOptions({
				path: { game_id: params.gameId, faction_id: params.id },
			}),
		);
	},
	errorComponent: BasicErrorComponent,
});

function RouteComponent() {
	return <Outlet />;
}
