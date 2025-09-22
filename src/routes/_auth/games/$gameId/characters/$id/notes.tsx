import { createFileRoute } from "@tanstack/react-router";
import type { NoteTreeNode } from "~/api";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useGetCharacterNoteTree } from "~/queries/characters";

export const Route = createFileRoute("/_auth/games/$gameId/characters/$id/notes")({
	component: RouteComponent,
});

function RouteComponent() {
	const { gameId, id } = Route.useParams();
	const { data: notes } = useGetCharacterNoteTree(gameId, id);

	return (
		<div className="space-y-4">
			{notes?.data?.notes_tree?.map((node) => (
				<NoteCard key={node.id} note={node} />
			))}
		</div>
	);
}

function NoteCard({ note }: { note: NoteTreeNode }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{note.name}</CardTitle>
			</CardHeader>
			<CardContent>
				<p>{note.content_plain_text}</p>
			</CardContent>
		</Card>
	);
}
