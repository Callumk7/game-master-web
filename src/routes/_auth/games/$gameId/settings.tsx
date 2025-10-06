import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/games/$gameId/settings")({
	component: RouteComponent,
});

function RouteComponent() {
	return <MembershipDashboard />;
}

function MembershipDashboard() {
	return <div>Membership dashboard</div>;
}
