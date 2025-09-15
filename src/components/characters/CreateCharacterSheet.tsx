import { Sheet, SheetContent } from "../ui/sheet";
import { CreateCharacterForm } from "./CreateCharacterForm";

interface CreateCharacterSheetProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}

export function CreateCharacterSheet({ isOpen, setIsOpen }: CreateCharacterSheetProps) {
	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetContent>
				<CreateCharacterForm />
			</SheetContent>
		</Sheet>
	);
}
