import type { Quest } from "~/api/types.gen";
import { EditEntityDialog } from "../edit-entity-dialog";
import { EditQuestForm } from "./edit-quest-form";

interface EditQuestDialogProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	quest: Quest;
}

export function EditQuestDialog({
	isOpen,
	setIsOpen,
	quest,
}: EditQuestDialogProps) {
	return (
		<EditEntityDialog entity={quest} isOpen={isOpen} setIsOpen={setIsOpen}>
			<EditQuestForm
				initialData={quest}
				params={{ gameId: quest.game_id, id: quest.id }}
			/>
		</EditEntityDialog>
	);
}