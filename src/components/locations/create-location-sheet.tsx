import {
	Select,
	SelectContent,
	SelectItem,
	SelectPositioner,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
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
				<Select>
					<SelectTrigger>
						<SelectValue placeholder="Select a parent location" />
					</SelectTrigger>
					<SelectPositioner alignItemWithTrigger>
						<SelectContent>
							<SelectItem>Parent Location 1</SelectItem>
							<SelectItem>Parent Location 2</SelectItem>
							<SelectItem>Parent Location 3</SelectItem>
						</SelectContent>
					</SelectPositioner>
				</Select>
				<CreateLocationForm />
			</SheetContent>
		</Sheet>
	);
}
