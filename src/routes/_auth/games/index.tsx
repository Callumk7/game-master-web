import { createFileRoute } from "@tanstack/react-router";
import { listGamesOptions } from "~/api/@tanstack/react-query.gen";
import { AuthenticatedLayout } from "~/components/authenticated-layout";
import { GamesList } from "~/components/games-list";

export const Route = createFileRoute("/_auth/games/")({
	component: RouteComponent,
	loader: async ({ context }) =>
		await context.queryClient.ensureQueryData(listGamesOptions()),
});

function RouteComponent() {
	const { user } = Route.useRouteContext();

	return (
		<AuthenticatedLayout user={user!}>
			<GamesList />
		</AuthenticatedLayout>
	);
}
