import * as React from "react";
import { useIsCreateQuestOpen, useUIActions } from "~/state/ui";
import { Sheet, SheetContent } from "../ui/sheet";
import { CreateQuestForm } from "./create-quest-form";

export function CreateQuestSheet() {
	const sheetRef = React.useRef<HTMLDivElement>(null);
	const isCreateQuestOpen = useIsCreateQuestOpen();
	const { setIsCreateQuestOpen } = useUIActions();
	return (
		<Sheet open={isCreateQuestOpen} onOpenChange={setIsCreateQuestOpen}>
			<SheetContent className="p-4 pt-10 overflow-scroll" width="lg" ref={sheetRef}>
				<CreateQuestForm container={sheetRef} />
			</SheetContent>
		</Sheet>
	);
}
