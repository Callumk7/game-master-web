import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/games")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
