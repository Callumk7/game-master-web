import * as React from "react";
import { useIsCreateCharacterOpen, useUIActions } from "~/state/ui";
import { Sheet, SheetContent } from "../ui/sheet";
import { CreateCharacterForm } from "./create-character-form";

// interface CreateCharacterSheetProps {
// 	isOpen?: boolean;
// 	setIsOpen?: (isOpen: boolean) => void;
// }

export function CreateCharacterSheet() {
	const sheetRef = React.useRef<HTMLDivElement>(null);
	const isCreateCharacterOpen = useIsCreateCharacterOpen();
	const { setIsCreateCharacterOpen } = useUIActions();
	// const open = isOpen ?? isCreateCharacterOpen;
	// const setOpen = setIsOpen ?? setIsCreateCharacterOpen;

	return (
		<Sheet open={isCreateCharacterOpen} onOpenChange={setIsCreateCharacterOpen}>
			<SheetContent className="p-4 pt-10 overflow-scroll" width="lg" ref={sheetRef}>
				<CreateCharacterForm
					onSuccess={() => setIsCreateCharacterOpen(false)}
					container={sheetRef}
				/>
			</SheetContent>
		</Sheet>
	);
}
