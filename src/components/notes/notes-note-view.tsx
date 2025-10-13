import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import {
	deleteNoteLinkMutation,
	getNoteLinksQueryKey,
} from "~/api/@tanstack/react-query.gen";
import { useGetNoteNotesQuery } from "~/queries/notes";
import { EntityNotesView } from "../views/entity-notes-view";
import { CreateNoteSheet } from "./create-note-sheet";

interface NoteNoteViewProps {
	gameId: string;
	noteId: string;
}

export function NoteNoteView({ gameId, noteId }: NoteNoteViewProps) {
	const client = useQueryClient();
	const { notes } = useGetNoteNotesQuery(gameId, noteId);

	const [isNewNoteSheetOpen, setIsNewNoteSheetOpen] = React.useState(false);
	const [selectedNoteId, setSelectedNoteId] = React.useState<string | null>(null);

	const removeNote = useMutation(deleteNoteLinkMutation());
	const handleDeleteNote = (noteId: string) => {
		removeNote.mutateAsync(
			{
				path: {
					game_id: gameId,
					note_id: noteId,
					entity_id: noteId,
					entity_type: "note",
				},
			},
			{
				onSuccess: () => {
					client.invalidateQueries({
						queryKey: getNoteLinksQueryKey({
							path: { game_id: gameId, note_id: noteId },
						}),
					});
				},
			},
		);
	};
	return (
		<>
			<EntityNotesView
				gameId={gameId}
				notes={notes}
				selectedNoteId={selectedNoteId}
				setSelectedNoteId={setSelectedNoteId}
				setIsNewNoteSheetOpen={setIsNewNoteSheetOpen}
				handleDeleteNote={handleDeleteNote}
			/>
			<CreateNoteSheet
				isOpen={isNewNoteSheetOpen}
				setIsOpen={setIsNewNoteSheetOpen}
				link={{ linkId: noteId, linkType: "note" }}
			/>
		</>
	);
}
