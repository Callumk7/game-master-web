import { Button } from "../ui/button";
import {
	Popover,
	PopoverContent,
	PopoverPositioner,
	PopoverTrigger,
} from "../ui/popover";
import { CreateNoteLink } from "./create-note-link";

interface NoteLinksPopoverProps {
	gameId: string;
	noteId: string;
}

export function NoteLinksPopover({ gameId, noteId }: NoteLinksPopoverProps) {
	return (
		<Popover>
			<PopoverTrigger render={<Button />}>Create Link</PopoverTrigger>
			<PopoverPositioner align="start">
				<PopoverContent>
					<CreateNoteLink gameId={gameId} noteId={noteId} />
				</PopoverContent>
			</PopoverPositioner>
		</Popover>
	);
}
