import { createFileRoute, Navigate } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";
import type { Note } from "~/api";
import {
	listPinnedEntitiesQueryKey,
	useGetNoteLinksQuery,
} from "~/api/@tanstack/react-query.gen";
import { useAddTab } from "~/components/entity-tabs";
import { EntityView } from "~/components/entity-view";
import { EntityLinksTable } from "~/components/links/entity-links-table";
import { createBaseLinkTableColumns } from "~/components/links/link-table-columns";
import type { GenericLinksResponse } from "~/components/links/types";
import { flattenLinksForTable } from "~/components/links/utils";
import { NoteImages } from "~/components/notes/note-images";
import { NoteLinksPopover } from "~/components/notes/note-links-popover";
import { NoteNoteView } from "~/components/notes/notes-note-view";
import { Badge } from "~/components/ui/badge";
import { EntityEditor } from "~/components/ui/editor/entity-editor";
import {
	useDeleteNoteMutation,
	useNoteSuspenseQuery,
	useUpdateNoteMutation,
} from "~/queries/notes";

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

	const navigate = Route.useNavigate();

	const context = Route.useRouteContext();
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

	const handleTogglePin = async () => {
		updateNote.mutateAsync(
			{
				body: { note: { pinned: !note.pinned } },
				path: { game_id: gameId, id: note.id },
			},
			{
				onSuccess: () => {
					context.queryClient.invalidateQueries({
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
		toast("Note deleted successfully!");
		navigate({ to: "." });
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

	const columns = React.useMemo(
		() => createBaseLinkTableColumns(gameId, note.id, "note"),
		[gameId, note.id],
	);

	const linksTab = (
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
			content: <NoteNoteView gameId={gameId} noteId={note.id} />,
		},
		{
			id: "images",
			label: "Images",
			content: <NoteImages gameId={gameId} noteId={note.id} />,
		},
	];

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
			onEdit={() => navigate({ to: "edit" })}
			onTogglePin={handleTogglePin}
			onDelete={handleDelete}
		/>
	);
}
