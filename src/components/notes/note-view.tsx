import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";
import type { Note } from "~/api";
import {
	listPinnedEntitiesQueryKey,
	useGetNoteLinksQuery,
} from "~/api/@tanstack/react-query.gen";
import { EntityLinksTable } from "~/components/links/entity-links-table";
import { createBaseLinkTableColumns } from "~/components/links/link-table-columns";
import type { GenericLinksResponse } from "~/components/links/types";
import { flattenLinksForTable } from "~/components/links/utils";
import { NoteImages } from "~/components/notes/note-images";
import { NoteLinksPopover } from "~/components/notes/note-links-popover";
import { NoteNoteView } from "~/components/notes/notes-note-view";
import { EntityEditor } from "~/components/ui/editor/entity-editor";
import { EntityView } from "~/components/views/entity-view";
import { useDeleteNoteMutation, useUpdateNoteMutation } from "~/queries/notes";
import { useHandleEditNote } from "~/state/ui";
import { createBadges } from "../utils";

interface NoteViewProps {
	note: Note;
	gameId: string;
}

export function NoteView({ note, gameId }: NoteViewProps) {
	const queryClient = useQueryClient();
	const navigate = useNavigate({ from: "/games/$gameId/notes/$id" });

	const updateNote = useUpdateNoteMutation(gameId, note.id);
	const handleTogglePin = async () => {
		updateNote.mutateAsync(
			{
				body: { note: { pinned: !note.pinned } },
				path: { game_id: gameId, id: note.id },
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: listPinnedEntitiesQueryKey({
							path: { game_id: gameId },
						}),
					});
				},
			},
		);
	};

	const deleteNote = useDeleteNoteMutation(gameId, note.id);
	const handleDelete = () => {
		deleteNote.mutate({
			path: { game_id: gameId, id: note.id },
		});
		toast.success("Note deleted successfully!");
		navigate({ to: ".." });
	};

	const handleEdit = useHandleEditNote(note.id);

	const tabs = [
		{
			id: "content",
			label: "Content",
			content: <ContentTab note={note} gameId={gameId} />,
		},
		{
			id: "links",
			label: "Links",
			content: <LinksTab note={note} gameId={gameId} />,
		},
		{
			id: "notes",
			label: "Notes",
			content: <NoteNoteView gameId={gameId} noteId={note.id} />,
		},
		{
			id: "images",
			label: "Images",
			content: <NoteImages gameId={gameId} noteId={note.id} />,
		},
	];

	const badges = createBadges(note.tags);

	return (
		<EntityView
			id={note.id}
			gameId={gameId}
			type="note"
			content={note.content}
			content_plain_text={note.content_plain_text}
			name={note.name}
			badges={badges}
			pinned={note.pinned}
			tabs={tabs}
			onEdit={handleEdit}
			onTogglePin={handleTogglePin}
			onDelete={handleDelete}
		/>
	);
}

// =============================================================================
// CONTENT TAB COMPONENT
// =============================================================================
interface ContentTabProps {
	note: Note;
	gameId: string;
}
function ContentTab({ note, gameId }: ContentTabProps) {
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

	return (
		<EntityEditor
			content={note.content}
			gameId={gameId}
			entityType="note"
			entityId={note.id}
			onSave={handleSave}
		/>
	);
}

// =============================================================================
// LINKS TAB COMPONENT
// =============================================================================
interface LinksTabProps {
	note: Note;
	gameId: string;
}
function LinksTab({ note, gameId }: LinksTabProps) {
	const {
		data: linksResponse,
		isLoading: linksLoading,
		isError: linksError,
		error: linksQueryError,
	} = useGetNoteLinksQuery({
		path: { game_id: gameId, note_id: note.id },
	});

	const columns = React.useMemo(
		() => createBaseLinkTableColumns(gameId, note.id, "note"),
		[gameId, note.id],
	);

	return (
		<div className="space-y-4">
			<NoteLinksPopover gameId={gameId} noteId={note.id} />
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
					columns={columns}
				/>
			)}
		</div>
	);
}
