import { useGetGameLinksData } from "~/queries/utils";
import { useEditLocationId, useIsEditLocationOpen, useUIActions } from "~/state/ui";
import { EditEntityDialog } from "../edit-entity-dialog";
import { EditLocationForm } from "./edit-location-form";

interface EditLocationDialogProps {
	gameId: string;
}

export function EditLocationDialog({ gameId }: EditLocationDialogProps) {
	const isOpen = useIsEditLocationOpen();
	const { setIsEditLocationOpen } = useUIActions();
	const locationId = useEditLocationId();
	const { locations } = useGetGameLinksData(gameId);
	const location = locations.find((l) => l.id === locationId);

	if (!location) {
		return null;
	}

	return (
		<EditEntityDialog
			entity={location}
			isOpen={isOpen}
			setIsOpen={setIsEditLocationOpen}
		>
			<EditLocationForm
				initialData={location}
				params={{ gameId, id: location.id }}
			/>
		</EditEntityDialog>
	);
}
