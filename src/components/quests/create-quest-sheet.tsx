import { Sheet, SheetContent } from "../ui/sheet";
import { CreateQuestForm } from "./create-quest-form";

interface CreateQuestSheetProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}

export function CreateQuestSheet({ isOpen, setIsOpen }: CreateQuestSheetProps) {
	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetContent className="p-4 pt-10" width="lg">
				<CreateQuestForm />
			</SheetContent>
		</Sheet>
	);
}
