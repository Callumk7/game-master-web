import { createFileRoute } from "@tanstack/react-router";
import { Container } from "~/components/container";
import { CreateNoteForm } from "~/components/notes/create-note-form";

export const Route = createFileRoute("/_auth/games/$gameId/notes/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Container>
			<CreateNoteForm />
		</Container>
	);
}
