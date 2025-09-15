import { createFileRoute } from "@tanstack/react-router";
import { CreateFactionForm } from "~/components/factions/CreateFactionForm";

export const Route = createFileRoute("/_auth/games/$gameId/factions/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<CreateFactionForm />
		</div>
	);
}
