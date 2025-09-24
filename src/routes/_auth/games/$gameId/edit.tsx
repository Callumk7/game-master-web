import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/games/$gameId/edit")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_auth/games/$id/edit"!</div>;
}
