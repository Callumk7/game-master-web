import { createFileRoute } from "@tanstack/react-router";
import { SplitViewLayout } from "~/components/layout/split-view";

export const Route = createFileRoute("/_auth/games/$gameId/split")({
	component: RouteComponent,
});

function RouteComponent() {
	const { gameId } = Route.useParams();

	return <SplitViewLayout gameId={gameId} />;
}
