import { createFileRoute, Navigate } from "@tanstack/react-router";
import type { Note } from "~/api";
import { useGetNoteLinksQuery } from "~/api/@tanstack/react-query.gen";
import { useAddTab } from "~/components/entity-tabs";
import { EntityView } from "~/components/entity-view";
import { CreateNoteLink } from "~/components/notes/create-note-link";
import { Badge } from "~/components/ui/badge";
import { EntityEditor } from "~/components/ui/editor/entity-editor";
import { EntityLinksTable } from "~/components/ui/entity-links-table";
import { useNoteSuspenseQuery, useUpdateNoteMutation } from "~/queries/notes";
import { flattenLinksForTable, type GenericLinksResponse } from "~/utils/linkHelpers";

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
		entityType: "notes",
		gameId,
	});

	if (!note) {
		return <Navigate to=".." />;
	}

	return <NoteView note={note} gameId={gameId} />;
}

// MAIN VIEW COMPONENT

interface NoteViewProps {
	note: Note;
	gameId: string;
}

function NoteView({ note, gameId }: NoteViewProps) {
	const {
		data: linksResponse,
		isLoading: linksLoading,
		isError: linksError,
		error: linksQueryError,
	} = useGetNoteLinksQuery({
		path: { game_id: gameId, note_id: note.id },
	});

	const updateNote = useUpdateNoteMutation(gameId, note.id);

	const handleSave = async (payload: {
		content: string;
		content_plain_text: string;
	}) => {
		updateNote.mutate({
			body: { note: payload },
			path: { game_id: gameId, id: note.id },
		});
	};

	const badges = note.tags && note.tags.length > 0 && (
		<div className="flex flex-wrap gap-2">
			{note.tags.map((tag) => (
				<Badge key={tag} variant="secondary">
					{tag}
				</Badge>
			))}
		</div>
	);

	const contentTab = (
		<EntityEditor
			content={note.content}
			gameId={gameId}
			entityType="note"
			entityId={note.id}
			onSave={handleSave}
			isSaving={updateNote.isPending}
		/>
	);

	const linksTab = (
		<div className="space-y-4">
			<CreateNoteLink gameId={gameId} noteId={note.id} />
			{linksLoading && (
				<div className="text-muted-foreground">Loading links...</div>
			)}
			{linksError && (
				<div className="text-destructive">
					Error loading links: {linksQueryError?.message}
				</div>
			)}
			{!linksLoading && !linksError && linksResponse && (
				<EntityLinksTable
					links={flattenLinksForTable(linksResponse as GenericLinksResponse)}
					gameId={gameId}
					sourceId={note.id}
					sourceType="note"
				/>
			)}
		</div>
	);

	const tabs = [
		{
			id: "content",
			label: "Content",
			content: contentTab,
		},
		{
			id: "links",
			label: "Links",
			content: linksTab,
		},
		{
			id: "notes",
			label: "Notes",
			content: <div>Notes tabs tbc</div>,
		},
	];

	const navigate = Route.useNavigate();

	return (
		<EntityView
			name={note.name}
			badges={badges}
			tabs={tabs}
			onEdit={() => navigate({ to: "edit" })}
		/>
	);
}
