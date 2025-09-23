import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getNoteLinksOptions, getNoteOptions } from "~/api/@tanstack/react-query.gen";
import { BasicErrorComponent } from "~/components/error";

export const Route = createFileRoute("/_auth/games/$gameId/notes/$id")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			getNoteOptions({
				path: {
					game_id: params.gameId,
					id: params.id,
				},
			}),
		);
		context.queryClient.ensureQueryData(
			getNoteLinksOptions({
				path: {
					game_id: params.gameId,
					note_id: params.id,
				},
			}),
		);
	},
	errorComponent: BasicErrorComponent,
});

function RouteComponent() {
	return <Outlet />;
}
