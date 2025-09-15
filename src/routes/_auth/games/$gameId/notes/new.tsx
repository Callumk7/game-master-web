import { createFileRoute } from "@tanstack/react-router";
import { CreateNoteFormV2 } from "~/components/notes/CreateNoteFormV2";

export const Route = createFileRoute("/_auth/games/$gameId/notes/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<CreateNoteFormV2 />
		</div>
	);
}
