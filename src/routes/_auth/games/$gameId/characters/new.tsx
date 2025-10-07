import { createFileRoute } from "@tanstack/react-router";
import { CreateCharacterForm } from "~/components/characters/create-character-form";
import { Container } from "~/components/container";

export const Route = createFileRoute("/_auth/games/$gameId/characters/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Container>
			<CreateCharacterForm />
		</Container>
	);
}
