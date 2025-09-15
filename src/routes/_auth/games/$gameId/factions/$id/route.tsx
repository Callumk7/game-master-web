import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/games/$gameId/factions/$id")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
