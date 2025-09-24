import { createFileRoute } from "@tanstack/react-router";
import { CreateNoteForm } from "~/components/notes/create-note-form";

export const Route = createFileRoute("/_auth/games/$gameId/notes/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<CreateNoteForm />
		</div>
	);
}
