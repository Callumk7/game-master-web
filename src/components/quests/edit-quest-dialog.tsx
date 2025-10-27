import { useGetGameLinksData } from "~/queries/utils";
import { useEditQuestId, useIsEditQuestOpen, useUIActions } from "~/state/ui";
import { EditEntityDialog } from "../edit-entity-dialog";
import { EditQuestForm } from "./edit-quest-form";

interface EditQuestDialogProps {
	gameId: string;
}

export function EditQuestDialog({ gameId }: EditQuestDialogProps) {
	const isOpen = useIsEditQuestOpen();
	const { setIsEditQuestOpen } = useUIActions();
	const questId = useEditQuestId();
	const { quests } = useGetGameLinksData(gameId);
	const quest = quests.find((q) => q.id === questId);

	if (!quest) {
		return null;
	}
	return (
		<EditEntityDialog entity={quest} isOpen={isOpen} setIsOpen={setIsEditQuestOpen}>
			<EditQuestForm initialData={quest} params={{ gameId, id: quest.id }} />
		</EditEntityDialog>
	);
}
