import { useListNotesQuery } from "~/queries/notes";
import { useSmartForm } from "../forms/smart-factory";

interface CreateCharacterNoteFormProps {
	gameId: string;
	characterId: string;
}

export function CreateCharacterNoteForm({
	gameId,
	characterId,
}: CreateCharacterNoteFormProps) {
	const { data: notes } = useListNotesQuery(gameId);
}
