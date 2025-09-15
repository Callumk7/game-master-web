import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/games/$gameId/quests/$id")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
