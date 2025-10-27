import { useGetGameLinksData } from "~/queries/utils";
import { useEditFactionId, useIsEditFactionOpen, useUIActions } from "~/state/ui";
import { EditEntityDialog } from "../edit-entity-dialog";
import { EditFactionForm } from "./edit-faction-form";

interface EditFactionDialogProps {
	gameId: string;
}

export function EditFactionDialog({ gameId }: EditFactionDialogProps) {
	const isOpen = useIsEditFactionOpen();
	const { setIsEditFactionOpen } = useUIActions();
	const factionId = useEditFactionId();
	const { factions } = useGetGameLinksData(gameId);
	const faction = factions.find((f) => f.id === factionId);

	if (!faction) {
		return null;
	}

	return (
		<EditEntityDialog
			entity={faction}
			isOpen={isOpen}
			setIsOpen={setIsEditFactionOpen}
		>
			<EditFactionForm initialData={faction} params={{ gameId, id: faction.id }} />
		</EditEntityDialog>
	);
}
