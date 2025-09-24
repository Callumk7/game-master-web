import { createFileRoute, Navigate } from "@tanstack/react-router";
import type { Note } from "~/api";
import { useGetNoteLinksQuery } from "~/api/@tanstack/react-query.gen";
import { useAddTab } from "~/components/entity-tabs";
import { EntityView } from "~/components/entity-view";
import { CreateNoteLink } from "~/components/notes/create-note-link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { EntityLinksTable } from "~/components/ui/entity-links-table";
import { MinimalTiptap } from "~/components/ui/shadcn-io/minimal-tiptap";
import { useEditorContentActions } from "~/components/ui/shadcn-io/minimal-tiptap/hooks";
import { parseContentForEditor } from "~/components/ui/shadcn-io/minimal-tiptap/utils";
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

	const { isUpdated, setIsUpdated, onChange, getPayload } = useEditorContentActions();

	const updateNote = useUpdateNoteMutation(gameId, note.id);

	const handleSave = () => {
		updateNote.mutate({
			body: getPayload("note"),
			path: { game_id: gameId, id: note.id },
		});
		setIsUpdated(false);
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
		<div className="space-y-4">
			<MinimalTiptap
				content={parseContentForEditor(note.content)}
				onChange={onChange}
			/>
			<Button variant={"secondary"} onClick={handleSave} disabled={!isUpdated}>
				Save
			</Button>
		</div>
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

	return <EntityView name={note.name} badges={badges} tabs={tabs} />;
}
