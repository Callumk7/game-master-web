import * as React from "react";
import { useIsCreateLocationOpen, useUIActions } from "~/state/ui";
import { Sheet, SheetContent } from "../ui/sheet";
import { CreateLocationForm } from "./create-location-form";

export function CreateLocationSheet() {
	const sheetRef = React.useRef<HTMLDivElement>(null);
	const isCreateLocationOpen = useIsCreateLocationOpen();
	const { setIsCreateLocationOpen } = useUIActions();
	return (
		<Sheet open={isCreateLocationOpen} onOpenChange={setIsCreateLocationOpen}>
			<SheetContent className="p-4 pt-10 overflow-scroll" width="lg" ref={sheetRef}>
				<CreateLocationForm
					container={sheetRef}
					onSuccess={() => setIsCreateLocationOpen(false)}
				/>
			</SheetContent>
		</Sheet>
	);
}
