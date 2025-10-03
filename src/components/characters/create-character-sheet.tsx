import * as React from "react";
import { useIsCreateCharacterOpen, useUIActions } from "~/state/ui";
import { Sheet, SheetContent } from "../ui/sheet";
import { CreateCharacterForm } from "./create-character-form";

interface CreateCharacterSheetProps {
	isOpen?: boolean;
	setIsOpen?: (isOpen: boolean) => void;
	factionId?: string;
}

export function CreateCharacterSheet({
	isOpen,
	setIsOpen,
	factionId,
}: CreateCharacterSheetProps) {
	const sheetRef = React.useRef<HTMLDivElement>(null);
	const isCreateCharacterOpen = useIsCreateCharacterOpen();
	const { setIsCreateCharacterOpen } = useUIActions();
	const open = isOpen ?? isCreateCharacterOpen;
	const setOpen = setIsOpen ?? setIsCreateCharacterOpen;

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetContent className="p-4 pt-10 overflow-scroll" width="lg" ref={sheetRef}>
				<CreateCharacterForm
					onSuccess={() => setIsCreateCharacterOpen(false)}
					container={sheetRef}
					factionId={factionId}
				/>
			</SheetContent>
		</Sheet>
	);
}
