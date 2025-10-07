import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
	getLocationLinksOptions,
	getLocationOptions,
} from "~/api/@tanstack/react-query.gen";
import { Container } from "~/components/container";
import { BasicErrorComponent } from "~/components/error";

export const Route = createFileRoute("/_auth/games/$gameId/locations/$id")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			getLocationOptions({
				path: { game_id: params.gameId, id: params.id },
			}),
		);
		context.queryClient.ensureQueryData(
			getLocationLinksOptions({
				path: { game_id: params.gameId, location_id: params.id },
			}),
		);
	},
	errorComponent: BasicErrorComponent,
});

function RouteComponent() {
	return (
		<Container>
			<Outlet />
		</Container>
	);
}
