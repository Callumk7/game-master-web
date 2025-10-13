import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import {
	deleteLocationLinkMutation,
	getLocationLinksQueryKey,
} from "~/api/@tanstack/react-query.gen";
import { useGetLocationNotesQuery } from "~/queries/locations";
import { CreateNoteSheet } from "../notes/create-note-sheet";
import { EntityNotesView } from "../views/entity-notes-view";

interface LocationNoteViewProps {
	gameId: string;
	locationId: string;
}

export function LocationNoteView({ gameId, locationId }: LocationNoteViewProps) {
	const client = useQueryClient();
	const { notes } = useGetLocationNotesQuery(gameId, locationId);

	const [isNewNoteSheetOpen, setIsNewNoteSheetOpen] = React.useState(false);
	const [selectedNoteId, setSelectedNoteId] = React.useState<string | null>(null);

	const removeNote = useMutation(deleteLocationLinkMutation());
	const handleDeleteNote = (noteId: string) => {
		removeNote.mutateAsync(
			{
				path: {
					game_id: gameId,
					location_id: locationId,
					entity_id: noteId,
					entity_type: "note",
				},
			},
			{
				onSuccess: () => {
					client.invalidateQueries({
						queryKey: getLocationLinksQueryKey({
							path: { game_id: gameId, location_id: locationId },
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
				link={{ linkId: locationId, linkType: "location" }}
			/>
		</>
	);
}
