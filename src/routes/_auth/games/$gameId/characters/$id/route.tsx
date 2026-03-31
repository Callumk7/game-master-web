import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import {
	getCharacterLinksOptions,
	getCharacterOptions,
	getEntityPrimaryImageOptions,
} from "~/api/@tanstack/react-query.gen";
import { Container } from "~/components/container";
import { getErrorMessage } from "~/utils/api-errors";
import { showErrorToast } from "~/utils/show-error-toast";

export const Route = createFileRoute("/_auth/games/$gameId/characters/$id")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			getCharacterOptions({
				path: { game_id: params.gameId, id: params.id },
			}),
		);
		context.queryClient.ensureQueryData(
			getEntityPrimaryImageOptions({
				path: {
					game_id: params.gameId,
					entity_id: params.id,
					entity_type: "character",
				},
			}),
		);

		context.queryClient.ensureQueryData(
			getCharacterLinksOptions({
				path: { game_id: params.gameId, character_id: params.id },
			}),
		);
	},
	onCatch: (error) => {
		console.error("[Character route]", getErrorMessage(error));
	},
	onError: (error) => {
		showErrorToast(error, "Failed to load character");
		throw redirect({ to: ".." });
	},
});

function RouteComponent() {
	return (
		<Container>
			<Outlet />
		</Container>
	);
}
