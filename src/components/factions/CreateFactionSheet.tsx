import { Sheet, SheetContent } from "../ui/sheet";
import { CreateFactionForm } from "./CreateFactionForm";

interface CreateFactionSheetProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}

export function CreateFactionSheet({ isOpen, setIsOpen }: CreateFactionSheetProps) {
	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetContent className="p-4 pt-10" width="lg">
				<CreateFactionForm />
			</SheetContent>
		</Sheet>
	);
}
