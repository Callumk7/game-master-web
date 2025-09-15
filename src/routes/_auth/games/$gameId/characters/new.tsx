import { createFileRoute } from "@tanstack/react-router";
import { CreateCharacterForm } from "~/components/characters/CreateCharacterForm";

export const Route = createFileRoute("/_auth/games/$gameId/characters/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<CreateCharacterForm />
		</div>
	);
}
