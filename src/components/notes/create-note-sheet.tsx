import { Sheet, SheetContent } from "../ui/sheet";
import { CreateNoteForm } from "./create-note-form";

interface CreateNoteSheetProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}

export function CreateNoteSheet({ isOpen, setIsOpen }: CreateNoteSheetProps) {
	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetContent className="p-4 pt-10" width="lg">
				<CreateNoteForm />
			</SheetContent>
		</Sheet>
	);
}
