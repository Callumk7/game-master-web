import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
	getCharacterLinksOptions,
	getCharacterNotesTreeOptions,
	getCharacterOptions,
} from "~/api/@tanstack/react-query.gen";
import { Container } from "~/components/container";
import { BasicErrorComponent } from "~/components/error";

export const Route = createFileRoute("/_auth/games/$gameId/characters/$id")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			getCharacterOptions({
				path: { game_id: params.gameId, id: params.id },
			}),
		);
		context.queryClient.ensureQueryData(
			getCharacterNotesTreeOptions({
				path: { game_id: params.gameId, id: params.id },
			}),
		);
		context.queryClient.ensureQueryData(
			getCharacterLinksOptions({
				path: { game_id: params.gameId, character_id: params.id },
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
