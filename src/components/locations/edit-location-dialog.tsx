import type { Location } from "~/api/types.gen";
import { EditEntityDialog } from "../edit-entity-dialog";
import { EditLocationForm } from "./edit-location-form";

interface EditLocationDialogProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	location: Location;
}

export function EditLocationDialog({
	isOpen,
	setIsOpen,
	location,
}: EditLocationDialogProps) {
	return (
		<EditEntityDialog entity={location} isOpen={isOpen} setIsOpen={setIsOpen}>
			<EditLocationForm
				initialData={location}
				params={{ gameId: location.game_id, id: location.id }}
			/>
		</EditEntityDialog>
	);
}
