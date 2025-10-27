import { useGetGameLinksData } from "~/queries/utils";
import { useEditCharacterId, useIsEditCharacterOpen, useUIActions } from "~/state/ui";
import { EditEntityDialog } from "../edit-entity-dialog";
import { EditCharacterForm } from "./edit-character-form";

interface EditCharacterDialogProps {
	gameId: string;
}

export function EditCharacterDialog({ gameId }: EditCharacterDialogProps) {
	const isOpen = useIsEditCharacterOpen();
	const { setIsEditCharacterOpen } = useUIActions();
	const characterId = useEditCharacterId();
	const { characters } = useGetGameLinksData(gameId);
	const character = characters.find((c) => c.id === characterId);

	if (!character) {
		return null;
	}

	return (
		<EditEntityDialog
			entity={character}
			isOpen={isOpen}
			setIsOpen={setIsEditCharacterOpen}
		>
			<EditCharacterForm
				initialData={character}
				params={{ gameId, id: character.id }}
			/>
		</EditEntityDialog>
	);
}
