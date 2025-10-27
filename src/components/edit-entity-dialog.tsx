import type { Character, Location, Note, Quest } from "~/api/types.gen";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface EditEntityDialogProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	children: React.ReactNode;
	entity: Character | Location | Quest | Note;
}

export function EditEntityDialog({
	isOpen,
	setIsOpen,
	children,
	entity,
}: EditEntityDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="min-w-fit">
				<DialogHeader>
					<DialogTitle>{`Edit ${entity.name}`}</DialogTitle>
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	);
}
