import { createFileRoute } from "@tanstack/react-router";
import { CreateLocationForm } from "~/components/locations/CreateLocationForm";

export const Route = createFileRoute("/_auth/games/$gameId/locations/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<CreateLocationForm />
		</div>
	);
}
