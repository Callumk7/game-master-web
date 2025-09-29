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
import { Link } from "~/components/ui/link";
import { ScrollArea } from "~/components/ui/scroll-area";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "~/components/ui/sidebar";
import { TiptapViewer } from "../ui/editor/viewer";

interface CharacterNotesViewProps {
	gameId: string;
	characterId: string;
}

export function CharacterNotesView({ gameId, characterId }: CharacterNotesViewProps) {
	const client = useQueryClient();

	const [isOpen, setIsOpen] = React.useState(false);
	const [selectedNoteId, setSelectedNoteId] = React.useState<string | null>(null);

	const { data: noteTree } = useGetCharacterNotesTreeQuery({
		path: { game_id: gameId, id: characterId },
	});

	const notes = noteTree?.data?.notes_tree || [];
	const selectedNote = notes.find((note) => note.id === selectedNoteId);

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
				queryKey: getCharacterNotesTreeQueryKey({
					path: { game_id: gameId, id: characterId },
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
				note: { parent_id: null, parent_type: null as any },
			},
		});
	};

	return (
		<>
			<div className="space-y-4">
				<div className="flex gap-4">
					<Button onClick={() => setIsOpen(true)}>Create Note</Button>
					<SelectNoteCombobox gameId={gameId} characterId={characterId} />
				</div>

				<div className="flex flex-col lg:flex-row gap-4 min-h-[calc(100vh-26rem)]">
					{/* Notes List - Left Column */}
					<div className="w-full lg:w-1/4 border rounded-lg bg-sidebar">
						<div className="p-2">
							<ScrollArea className="max-h-[calc(100vh-28rem)]">
								{notes.length === 0 ? (
									<div className="p-4 text-center text-sidebar-foreground/60">
										No notes found
									</div>
								) : (
									<SidebarMenu>
										{notes.map((note) => (
											<SidebarMenuItem
												key={note.id}
												className="group relative"
											>
												<SidebarMenuButton
													isActive={selectedNoteId === note.id}
													onClick={() =>
														setSelectedNoteId(note.id)
													}
													className="w-full pr-8"
												>
													<span className="truncate">
														{note.name}
													</span>
												</SidebarMenuButton>
												<Button
													variant="ghost"
													size="sm"
													className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-sidebar-accent z-10"
													onClick={(e) => {
														e.stopPropagation();
														handleDeleteNote(note.id);
													}}
												>
													<Trash2 className="h-3 w-3" />
												</Button>
											</SidebarMenuItem>
										))}
									</SidebarMenu>
								)}
							</ScrollArea>
						</div>
					</div>

					{/* Note Preview - Right Column */}
					<div className="flex-1 border rounded-lg bg-background">
						{selectedNote ? (
							<div className="flex flex-col">
								<div className="p-4 border-b bg-muted/30">
									<div className="flex justify-between items-center">
										<h2 className="text-xl font-semibold">
											{selectedNote.name}
										</h2>
										<Link
											to="/games/$gameId/notes/$id"
											params={{ gameId, id: selectedNote.id }}
										>
											<Button variant="outline" size="sm">
												Open in full editor
											</Button>
										</Link>
									</div>
								</div>
								<div className="p-4">
									<TiptapViewer
										key={selectedNote.id}
										content={selectedNote.content}
									/>
								</div>
							</div>
						) : (
							<div className="min-h-[calc(100vh-32rem)] flex items-center justify-center text-muted-foreground">
								Select a note to preview
							</div>
						)}
					</div>
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
