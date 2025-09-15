import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { StickyNote } from "lucide-react";
import {
	deleteNoteMutation,
	getNoteLinksOptions,
	listNotesQueryKey,
} from "~/api/@tanstack/react-query.gen";
import type { Note } from "~/api/types.gen";
import { Badge } from "~/components/ui/badge";
import { DetailTemplate } from "~/components/ui/DetailTemplate";
import { EntityLinksTable } from "~/components/ui/EntityLinksTable";
import { flattenLinksForTable, type GenericLinksResponse } from "~/utils/linkHelpers";
import { CreateNoteLink } from "./CreateNoteLink";

interface NoteDetailProps {
	note: Note;
	gameId: string;
}

export function NoteDetail({ note, gameId }: NoteDetailProps) {
	const formatDate = (dateString?: string) => {
		if (!dateString) return "Unknown";
		return new Date(dateString).toLocaleDateString();
	};

	const context = useRouteContext({ from: "/_auth/games/$gameId/notes/$id" });

	const {
		data: linksResponse,
		isLoading: linksLoading,
		isError: linksError,
		error: linksQueryError,
	} = useQuery(
		getNoteLinksOptions({
			path: { game_id: gameId, note_id: note.id },
		}),
	);

	const fields = [
		{ label: "Name", value: note.name },
		{ label: "ID", value: <span className="font-mono">#{note.id}</span> },
		{ label: "Created", value: formatDate(note.created_at) },
		{ label: "Last Updated", value: formatDate(note.updated_at) },
	];

	const navigate = useNavigate();

	const deleteNote = useMutation({
		...deleteNoteMutation(),
		onSuccess: () => {
			context.queryClient.invalidateQueries({
				queryKey: listNotesQueryKey({
					path: { game_id: gameId },
				}),
			});
			navigate({ to: ".." });
		},
	});

	const onDelete = () => {
		deleteNote.mutate({
			path: { game_id: gameId, id: note.id },
		});
	};

	return (
		<div className="space-y-6">
			<DetailTemplate
				title={note.name}
				icon={StickyNote}
				iconColor="text-yellow-600"
				editPath="/games/$gameId/notes/$id/edit"
				gameId={gameId}
				entityId={note.id.toString()}
				fields={fields}
				onDelete={onDelete}
				content={
					note.content
						? {
								title: "Content",
								value: note.content,
							}
						: undefined
				}
			/>
			{note.tags && note.tags.length > 0 && (
				<div className="space-y-2">
					<h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
					<div className="flex flex-wrap gap-2">
						{note.tags.map((tag) => (
							<Badge key={tag} variant="secondary">
								{tag}
							</Badge>
						))}
					</div>
				</div>
			)}
			<CreateNoteLink gameId={gameId} noteId={note.id.toString()} />
			<div className="space-y-4">
				<h2 className="text-lg font-semibold">Links</h2>
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
						links={flattenLinksForTable(
							linksResponse as GenericLinksResponse,
						)}
						gameId={gameId}
					/>
				)}
			</div>
		</div>
	);
}
