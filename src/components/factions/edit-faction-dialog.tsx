import type { Faction } from "~/api";
import { EditEntityDialog } from "../edit-entity-dialog";
import { EditFactionForm } from "./edit-faction-form";

interface EditFactionDialogProps {
	gameId: string;
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	faction: Faction;
}

export function EditFactionDialog({
	gameId,
	isOpen,
	setIsOpen,
	faction,
}: EditFactionDialogProps) {
	return (
		<EditEntityDialog entity={faction} isOpen={isOpen} setIsOpen={setIsOpen}>
			<EditFactionForm initialData={faction} params={{ gameId, id: faction.id }} />
		</EditEntityDialog>
	);
}
