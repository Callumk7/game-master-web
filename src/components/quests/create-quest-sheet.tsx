import * as React from "react";
import { useIsCreateQuestOpen, useUIActions } from "~/state/ui";
import { Sheet, SheetContent } from "../ui/sheet";
import { CreateQuestForm } from "./create-quest-form";

interface CreateQuestSheetProps {
	isOpen?: boolean;
	setIsOpen?: (isOpen: boolean) => void;
	parentId?: string;
}
export function CreateQuestSheet({ isOpen, setIsOpen, parentId }: CreateQuestSheetProps) {
	const sheetRef = React.useRef<HTMLDivElement>(null);
	const isCreateQuestOpen = useIsCreateQuestOpen();
	const { setIsCreateQuestOpen } = useUIActions();
	const open = isOpen ?? isCreateQuestOpen;
	const setOpen = setIsOpen ?? setIsCreateQuestOpen;

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetContent className="p-4 pt-10 overflow-scroll" width="lg" ref={sheetRef}>
				<CreateQuestForm
					onSuccess={() => setIsCreateQuestOpen(false)}
					container={sheetRef}
					parentId={parentId}
				/>
			</SheetContent>
		</Sheet>
	);
}
