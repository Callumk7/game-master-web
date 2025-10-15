import type { Location } from "~/api/types.gen";
import { EditEntityDialog } from "../edit-entity-dialog";
import { EditLocationForm } from "./edit-location-form";

interface EditLocationDialogProps {
	gameId: string;
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	location: Location;
}

export function EditLocationDialog({
	gameId,
	isOpen,
	setIsOpen,
	location,
}: EditLocationDialogProps) {
	return (
		<EditEntityDialog entity={location} isOpen={isOpen} setIsOpen={setIsOpen}>
			<EditLocationForm
				initialData={location}
				params={{ gameId, id: location.id }}
			/>
		</EditEntityDialog>
	);
}
