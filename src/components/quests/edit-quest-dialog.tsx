import type { Quest } from "~/api/types.gen";
import { EditEntityDialog } from "../edit-entity-dialog";
import { EditQuestForm } from "./edit-quest-form";
import { useParams } from "@tanstack/react-router";

interface EditQuestDialogProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	quest: Quest;
}

export function EditQuestDialog({ isOpen, setIsOpen, quest }: EditQuestDialogProps) {
	const { gameId } = useParams({ from: "/_auth/games/$gameId" });
	return (
		<EditEntityDialog entity={quest} isOpen={isOpen} setIsOpen={setIsOpen}>
			<EditQuestForm initialData={quest} params={{ gameId, id: quest.id }} />
		</EditEntityDialog>
	);
}
