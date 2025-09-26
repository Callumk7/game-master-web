import type { EntityType } from "~/types";
import { Sheet, SheetContent } from "../ui/sheet";
import { CreateNoteForm } from "./create-note-form";

interface CreateNoteSheetProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	parentId?: string;
	parentType?: EntityType;
}

export function CreateNoteSheet({
	isOpen,
	setIsOpen,
	parentId,
	parentType,
}: CreateNoteSheetProps) {
	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetContent className="p-4 pt-10" width="lg">
				<CreateNoteForm parentId={parentId} parentType={parentType} />
			</SheetContent>
		</Sheet>
	);
}
