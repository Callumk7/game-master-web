import type { Character } from "~/api/types.gen";
import { EditEntityDialog } from "../edit-entity-dialog";
import { EditCharacterForm } from "./edit-character-form";

interface EditCharacterDialogProps {
	gameId: string;
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	character: Character;
}

export function EditCharacterDialog({
	gameId,
	isOpen,
	setIsOpen,
	character,
}: EditCharacterDialogProps) {
	return (
		<EditEntityDialog entity={character} isOpen={isOpen} setIsOpen={setIsOpen}>
			<EditCharacterForm
				initialData={character}
				params={{ gameId, id: character.id }}
			/>
		</EditEntityDialog>
	);
}
