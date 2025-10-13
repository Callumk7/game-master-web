import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import {
	deleteQuestLinkMutation,
	getQuestLinksQueryKey,
} from "~/api/@tanstack/react-query.gen";
import { useGetQuestNotesQuery } from "~/queries/quests";
import { CreateNoteSheet } from "../notes/create-note-sheet";
import { EntityNotesView } from "../views/entity-notes-view";

interface QuestNoteViewProps {
	gameId: string;
	questId: string;
}

export function QuestNoteView({ gameId, questId }: QuestNoteViewProps) {
	const client = useQueryClient();
	const { notes } = useGetQuestNotesQuery(gameId, questId);

	const [isNewNoteSheetOpen, setIsNewNoteSheetOpen] = React.useState(false);
	const [selectedNoteId, setSelectedNoteId] = React.useState<string | null>(null);

	const removeNote = useMutation(deleteQuestLinkMutation());
	const handleDeleteNote = (noteId: string) => {
		removeNote.mutateAsync(
			{
				path: {
					game_id: gameId,
					quest_id: questId,
					entity_id: noteId,
					entity_type: "note",
				},
			},
			{
				onSuccess: () => {
					client.invalidateQueries({
						queryKey: getQuestLinksQueryKey({
							path: { game_id: gameId, quest_id: questId },
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
				selectedNoteId={selectedNoteId}
				setSelectedNoteId={setSelectedNoteId}
				setIsNewNoteSheetOpen={setIsNewNoteSheetOpen}
				handleDeleteNote={handleDeleteNote}
			/>
			<CreateNoteSheet
				isOpen={isNewNoteSheetOpen}
				setIsOpen={setIsNewNoteSheetOpen}
				link={{ linkId: questId, linkType: "quest" }}
			/>
		</>
	);
}
