import { createFileRoute } from "@tanstack/react-router";
import { Container } from "~/components/container";
import { CreateFactionForm } from "~/components/factions/create-faction-form";

export const Route = createFileRoute("/_auth/games/$gameId/factions/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Container>
			<CreateFactionForm />
		</Container>
	);
}
