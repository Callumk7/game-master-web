import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import {
	deleteCharacterLinkMutation,
	getCharacterLinksQueryKey,
} from "~/api/@tanstack/react-query.gen";
import { CreateNoteSheet } from "~/components/notes/create-note-sheet";
import { useGetCharacterNotesQuery } from "~/queries/characters";
import { EntityNotesView } from "../views/entity-notes-view";

interface CharacterNotesViewProps {
	gameId: string;
	characterId: string;
}

export function CharacterNotesView({ gameId, characterId }: CharacterNotesViewProps) {
	const client = useQueryClient();

	const [isNewNoteSheetOpen, setIsNewNoteSheetOpen] = React.useState(false);
	const [selectedNoteId, setSelectedNoteId] = React.useState<string | null>(null);

	const { notes } = useGetCharacterNotesQuery(gameId, characterId);

	const removeLink = useMutation(deleteCharacterLinkMutation());

	const handleDeleteNote = (noteId: string) => {
		if (selectedNoteId === noteId && notes.length > 1) {
			const currentIndex = notes.findIndex((note) => note.id === noteId);
			const nextNote = notes[currentIndex + 1] || notes[currentIndex - 1];
			setSelectedNoteId(nextNote?.id || null);
		}

		removeLink.mutateAsync(
			{
				path: {
					game_id: gameId,
					character_id: characterId,
					entity_id: noteId,
					entity_type: "note",
				},
			},
			{
				onSuccess: () => {
					client.invalidateQueries({
						queryKey: getCharacterLinksQueryKey({
							path: { game_id: gameId, character_id: characterId },
						}),
					});
				},
			},
		);
	};

	return (
		<>
			<EntityNotesView
				gameId={gameId}
				notes={notes}
				setIsNewNoteSheetOpen={setIsNewNoteSheetOpen}
				selectedNoteId={selectedNoteId}
				setSelectedNoteId={setSelectedNoteId}
				handleDeleteNote={handleDeleteNote}
			/>
			<CreateNoteSheet
				isOpen={isNewNoteSheetOpen}
				setIsOpen={setIsNewNoteSheetOpen}
				link={{ linkId: characterId, linkType: "character" }}
			/>
		</>
	);
}
