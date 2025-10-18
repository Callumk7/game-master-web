import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAddTab } from "~/components/entity-tabs";
import { NoteView } from "~/components/notes/note-view";
import { useNoteSuspenseQuery } from "~/queries/notes";

export const Route = createFileRoute("/_auth/games/$gameId/notes/$id/")({
	component: RouteComponent,
});

function RouteComponent() {
	const params = Route.useParams();
	const { gameId, id } = params;
	const { data } = useNoteSuspenseQuery(gameId, id);
	const note = data?.data;

	useAddTab({
		data: note,
		entityType: "note",
		gameId,
	});

	if (!note) {
		return <Navigate to=".." />;
	}

	return <NoteView note={note} gameId={gameId} />;
}
