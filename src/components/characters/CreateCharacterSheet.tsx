import { Sheet, SheetContent } from "../ui/sheet";
import { CreateCharacterForm } from "./CreateCharacterForm";

interface CreateCharacterSheetProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}

export function CreateCharacterSheet({ isOpen, setIsOpen }: CreateCharacterSheetProps) {
	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetContent className="p-4 pt-10" width="lg">
				<CreateCharacterForm />
			</SheetContent>
		</Sheet>
	);
}
