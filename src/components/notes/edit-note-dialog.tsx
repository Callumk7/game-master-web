import type { Note } from "~/api/types.gen";
import { EditEntityDialog } from "../edit-entity-dialog";
import { EditNoteForm } from "./edit-note-form";

interface EditNoteDialogProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	note: Note;
}

export function EditNoteDialog({
	isOpen,
	setIsOpen,
	note,
}: EditNoteDialogProps) {
	return (
		<EditEntityDialog entity={note} isOpen={isOpen} setIsOpen={setIsOpen}>
			<EditNoteForm
				initialData={note}
				params={{ gameId: note.game_id, id: note.id }}
			/>
		</EditEntityDialog>
	);
}