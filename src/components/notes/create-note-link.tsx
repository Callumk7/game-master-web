import { CreateLinkForm } from "../links";

interface CreateNoteLinkProps {
	gameId: string;
	noteId: string;
}

export function CreateNoteLink({ gameId, noteId }: CreateNoteLinkProps) {
	return (
		<CreateLinkForm gameId={gameId} sourceEntityType="note" sourceEntityId={noteId} />
	);
}
