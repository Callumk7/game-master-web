import { useIsCreateNoteOpen, useUIActions } from "~/state/ui";
import type { EntityType } from "~/types";
import { Sheet, SheetContent } from "../ui/sheet";
import { CreateNoteForm } from "./create-note-form";

interface CreateNoteSheetProps {
	parentId?: string;
	parentType?: EntityType;
}

export function CreateNoteSheet({ parentId, parentType }: CreateNoteSheetProps) {
	const isCreateNoteOpen = useIsCreateNoteOpen();
	const { setIsCreateNoteOpen } = useUIActions();
	return (
		<Sheet open={isCreateNoteOpen} onOpenChange={setIsCreateNoteOpen}>
			<SheetContent className="p-4 pt-10 overflow-scroll" width="lg">
				<CreateNoteForm parentId={parentId} parentType={parentType} />
			</SheetContent>
		</Sheet>
	);
}
