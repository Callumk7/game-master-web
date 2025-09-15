import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/games/$gameId/locations")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
