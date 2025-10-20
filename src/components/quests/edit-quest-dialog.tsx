import { useListQuestsQuery } from "~/api/@tanstack/react-query.gen";
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
	const { data: listQuestsResponse } = useListQuestsQuery({
		path: { game_id: gameId },
	});
	const quests = listQuestsResponse?.data ?? [];
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
