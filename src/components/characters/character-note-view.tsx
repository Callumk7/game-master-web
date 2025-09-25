import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import * as React from "react";
import {
	getCharacterNotesTreeQueryKey,
	updateNoteMutation,
	useGetCharacterNotesTreeQuery,
} from "~/api/@tanstack/react-query.gen";
import { SelectNoteCombobox } from "~/components/characters/select-note-combobox";
import { CreateNoteSheet } from "~/components/notes/create-note-sheet";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Link } from "~/components/ui/link";
import { TiptapViewer } from "../ui/editor/viewer";

interface CharacterNotesViewProps {
	gameId: string;
	characterId: string;
}

export function CharacterNotesView({ gameId, characterId }: CharacterNotesViewProps) {
	const client = useQueryClient();

	const [isOpen, setIsOpen] = React.useState(false);

	const { data: noteTree } = useGetCharacterNotesTreeQuery({
		path: { game_id: gameId, id: characterId },
	});

	const removeNote = useMutation({
		...updateNoteMutation(),
		onSuccess: () => {
			client.invalidateQueries({
				queryKey: getCharacterNotesTreeQueryKey({
					path: { game_id: gameId, id: characterId },
				}),
			});
		},
	});

	const handleDeleteNote = (noteId: string) => {
		removeNote.mutateAsync({
			path: { game_id: gameId, id: noteId },
			body: {
				note: { parent_id: null, parent_type: null as any },
			},
		});
	};

	return (
		<>
			<div className="space-y-4">
				<Button onClick={() => setIsOpen(true)}>Create Note</Button>
				<SelectNoteCombobox gameId={gameId} characterId={characterId} />
				<div className="grid grid-cols-3 gap-2">
					{noteTree?.data?.notes_tree?.map((note) => (
						<Card key={note.id}>
							<CardHeader className="relative">
								<CardTitle>{note.name}</CardTitle>
								<CardDescription>
									<Link
										to="/games/$gameId/notes/$id"
										params={{ gameId, id: note.id }}
										className="pl-0"
									>
										Go to note
									</Link>
								</CardDescription>
								<Button
									variant="ghost"
									className="absolute right-2 top-2"
									onClick={() => handleDeleteNote(note.id)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</CardHeader>
							<CardContent>
								<TiptapViewer content={note.content} />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
			<CreateNoteSheet
				isOpen={isOpen}
				setIsOpen={setIsOpen}
				parentType="character"
				parentId={characterId}
			/>
		</>
	);
}
