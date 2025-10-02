import { useIsCreateNoteOpen, useUIActions } from "~/state/ui";
import type { EntityType } from "~/types";
import { Sheet, SheetContent } from "../ui/sheet";
import { CreateNoteForm } from "./create-note-form";

interface CreateNoteSheetProps {
	isOpen?: boolean;
	setIsOpen?: (isOpen: boolean) => void;
	onSuccess?: () => void;
	parentId?: string;
	parentType?: EntityType;
}

export function CreateNoteSheet({
	parentId,
	parentType,
	isOpen,
	setIsOpen,
	onSuccess,
}: CreateNoteSheetProps) {
	const isCreateNoteOpen = useIsCreateNoteOpen();
	const { setIsCreateNoteOpen } = useUIActions();
	const open = isOpen ?? isCreateNoteOpen;
	const setOpen = setIsOpen ?? setIsCreateNoteOpen;

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetContent className="p-4 pt-10 overflow-scroll" width="lg">
				<CreateNoteForm
					parentId={parentId}
					parentType={parentType}
					onSuccess={onSuccess}
				/>
			</SheetContent>
		</Sheet>
	);
}
