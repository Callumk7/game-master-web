import { Sheet, SheetContent } from "../ui/sheet";
import { CreateLocationForm } from "./create-location-form";

interface CreateLocationSheetProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}

export function CreateLocationSheet({ isOpen, setIsOpen }: CreateLocationSheetProps) {
	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen} modal={false}>
			<SheetContent className="p-4 pt-10" width="lg">
				<CreateLocationForm onSuccess={() => setIsOpen(false)} />
			</SheetContent>
		</Sheet>
	);
}
