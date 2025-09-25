import { Sheet, SheetContent } from "../ui/sheet";
import { CreateCharacterForm } from "./create-character-form";

interface CreateCharacterSheetProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}

export function CreateCharacterSheet({ isOpen, setIsOpen }: CreateCharacterSheetProps) {
	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetContent className="p-4 pt-10 overflow-scroll" width="lg">
				<CreateCharacterForm />
			</SheetContent>
		</Sheet>
	);
}
