import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { toast } from "sonner";
import {
	getCharacterLinksOptions,
	getCharacterOptions,
	getEntityPrimaryImageOptions,
} from "~/api/@tanstack/react-query.gen";
import { Container } from "~/components/container";
import { isApiError } from "~/utils/api-errors";
import { parseApiErrors } from "~/utils/parse-errors";

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
		if (isApiError(error)) {
			const parsedError = parseApiErrors(error);
			console.error(parsedError);
		}
	},
	onError: (error) => {
		if (isApiError(error)) {
			const parsedError = parseApiErrors(error);
			toast.error(parsedError);
		} else {
			toast.error("Something went wrong!");
		}
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
