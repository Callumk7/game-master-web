import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getQuestLinksOptions, getQuestOptions } from "~/api/@tanstack/react-query.gen";
import { Container } from "~/components/container";
import { BasicErrorComponent } from "~/components/error";

export const Route = createFileRoute("/_auth/games/$gameId/quests/$id")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			getQuestOptions({
				path: {
					game_id: params.gameId,
					id: params.id,
				},
			}),
		);
		context.queryClient.ensureQueryData(
			getQuestLinksOptions({
				path: {
					game_id: params.gameId,
					quest_id: params.id,
				},
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
