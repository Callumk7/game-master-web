import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import {
	getFactionNotesTreeQueryKey,
	updateNoteMutation,
	useGetFactionNotesTreeQuery,
} from "~/api/@tanstack/react-query.gen";
import { CreateNoteSheet } from "../notes/create-note-sheet";
import { Button } from "../ui/button";
import { EntityNotesView } from "../views/entity-notes-view";

interface FactionNoteViewProps {
	gameId: string;
	factionId: string;
}

export function FactionNoteView({ gameId, factionId }: FactionNoteViewProps) {
	const client = useQueryClient();

	const [isNewNoteSheetOpen, setIsNewNoteSheetOpen] = React.useState(false);
	const [selectedNoteId, setSelectedNoteId] = React.useState<string | null>(null);

	const { data: noteTree } = useGetFactionNotesTreeQuery({
		path: { game_id: gameId, id: factionId },
	});

	const notes = noteTree?.data?.notes_tree || [];

	// Auto-select first note if none selected
	React.useEffect(() => {
		if (notes.length > 0 && !selectedNoteId) {
			setSelectedNoteId(notes[0].id);
		}
	}, [notes, selectedNoteId]);

	const removeNote = useMutation({
		...updateNoteMutation(),
		onSuccess: () => {
			client.invalidateQueries({
				queryKey: getFactionNotesTreeQueryKey({
					path: { game_id: gameId, id: factionId },
				}),
			});
		},
	});

	const handleDeleteNote = (noteId: string) => {
		if (selectedNoteId === noteId && notes.length > 1) {
			const currentIndex = notes.findIndex((note) => note.id === noteId);
			const nextNote = notes[currentIndex + 1] || notes[currentIndex - 1];
			setSelectedNoteId(nextNote?.id || null);
		}

		removeNote.mutateAsync({
			path: { game_id: gameId, id: noteId },
			body: {
				// @ts-expect-error: Limitation on swagger codegen
				note: { parent_id: null, parent_type: null },
			},
		});
	};

	const handleSuccess = () => {
		client.invalidateQueries({
			queryKey: getFactionNotesTreeQueryKey({
				path: { game_id: gameId, id: factionId },
			}),
		});
		setIsNewNoteSheetOpen(false);
	};

	return (
		<>
			<div className="space-y-4">
				<div className="flex gap-4">
					<Button onClick={() => setIsNewNoteSheetOpen(true)}>
						Create Note
					</Button>
				</div>

				<EntityNotesView
					gameId={gameId}
					notesTree={notes}
					handleDeleteNote={handleDeleteNote}
				/>
			</div>
			<CreateNoteSheet
				isOpen={isNewNoteSheetOpen}
				setIsOpen={setIsNewNoteSheetOpen}
				parentType="faction"
				parentId={factionId}
				onSuccess={handleSuccess}
			/>
		</>
	);
}
