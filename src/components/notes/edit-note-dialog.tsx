import { useListNotesQuery } from "~/api/@tanstack/react-query.gen";
import { useEditNoteId, useIsEditNoteOpen, useUIActions } from "~/state/ui";
import { EditEntityDialog } from "../edit-entity-dialog";
import { EditNoteForm } from "./edit-note-form";

interface EditNoteDialogProps {
	gameId: string;
}

export function EditNoteDialog({ gameId }: EditNoteDialogProps) {
	const isOpen = useIsEditNoteOpen();
	const { setIsEditNoteOpen } = useUIActions();
	const noteId = useEditNoteId();
	const { data: listNotesResponse } = useListNotesQuery({
		path: { game_id: gameId },
	});
	const notes = listNotesResponse?.data ?? [];
	const note = notes.find((n) => n.id === noteId);

	if (!note) {
		return null;
	}

	return (
		<EditEntityDialog entity={note} isOpen={isOpen} setIsOpen={setIsEditNoteOpen}>
			<EditNoteForm initialData={note} params={{ gameId, id: note.id }} />
		</EditEntityDialog>
	);
}
