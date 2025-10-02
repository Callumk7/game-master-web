import { useIsCreateFactionOpen, useUIActions } from "~/state/ui";
import { Sheet, SheetContent } from "../ui/sheet";
import { CreateFactionForm } from "./create-faction-form";

export function CreateFactionSheet() {
	const isCreateFactionOpen = useIsCreateFactionOpen();
	const { setIsCreateFactionOpen } = useUIActions();
	return (
		<Sheet open={isCreateFactionOpen} onOpenChange={setIsCreateFactionOpen}>
			<SheetContent className="p-4 pt-10 overflow-scroll" width="lg">
				<CreateFactionForm onSuccess={() => setIsCreateFactionOpen(false)} />
			</SheetContent>
		</Sheet>
	);
}
