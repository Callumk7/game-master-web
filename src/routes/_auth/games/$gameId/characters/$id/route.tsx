import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/games/$gameId/characters/$id")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
