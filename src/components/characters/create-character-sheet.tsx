import { useIsCreateCharacterOpen, useUIActions } from "~/state/ui";
import { Sheet, SheetContent } from "../ui/sheet";
import { CreateCharacterForm } from "./create-character-form";

export function CreateCharacterSheet() {
	const isCreateCharacterOpen = useIsCreateCharacterOpen();
	const { setIsCreateCharacterOpen } = useUIActions();
	return (
		<Sheet open={isCreateCharacterOpen} onOpenChange={setIsCreateCharacterOpen}>
			<SheetContent className="p-4 pt-10 overflow-scroll" width="lg">
				<CreateCharacterForm onSuccess={() => setIsCreateCharacterOpen(false)} />
			</SheetContent>
		</Sheet>
	);
}
