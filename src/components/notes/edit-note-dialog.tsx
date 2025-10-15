import type { Note } from "~/api/types.gen";
import { EditEntityDialog } from "../edit-entity-dialog";
import { EditNoteForm } from "./edit-note-form";

interface EditNoteDialogProps {
	gameId: string;
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	note: Note;
}

export function EditNoteDialog({ isOpen, setIsOpen, note, gameId }: EditNoteDialogProps) {
	return (
		<EditEntityDialog entity={note} isOpen={isOpen} setIsOpen={setIsOpen}>
			<EditNoteForm initialData={note} params={{ gameId, id: note.id }} />
		</EditEntityDialog>
	);
}
