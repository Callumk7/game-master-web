import type { Quest } from "~/api/types.gen";
import { EditEntityDialog } from "../edit-entity-dialog";
import { EditQuestForm } from "./edit-quest-form";

interface EditQuestDialogProps {
	gameId: string;
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	quest: Quest;
}

export function EditQuestDialog({
	isOpen,
	setIsOpen,
	quest,
	gameId,
}: EditQuestDialogProps) {
	return (
		<EditEntityDialog entity={quest} isOpen={isOpen} setIsOpen={setIsOpen}>
			<EditQuestForm initialData={quest} params={{ gameId, id: quest.id }} />
		</EditEntityDialog>
	);
}
