import { Trash2 } from "lucide-react";
import * as React from "react";
import type { NoteTreeNode } from "~/api";
import { Button } from "../ui/button";
import { TiptapViewer } from "../ui/editor/viewer";
import { Link } from "../ui/link";
import { ScrollArea } from "../ui/scroll-area";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

interface EntityNotesViewProps {
	gameId: string;
	notesTree: NoteTreeNode[];
	handleDeleteNote: (noteId: string) => void;
}

export function EntityNotesView({
	gameId,
	notesTree,
	handleDeleteNote,
}: EntityNotesViewProps) {
	const [selectedNoteId, setSelectedNoteId] = React.useState<string | null>(null);
	const selectedNote = notesTree.find((note) => note.id === selectedNoteId);

	return (
		<div className="space-y-4">
			{/* Some controls */}

			<div className="flex flex-col lg:flex-row gap-4 min-h-[calc(100vh-26rem)]">
				{/* Notes List - Left Column */}
				<div className="w-full lg:w-1/4 border rounded-lg bg-sidebar">
					<div className="p-2">
						<ScrollArea className="max-h-[calc(100vh-28rem)]">
							{notesTree.length === 0 ? (
								<div className="p-4 text-center text-sidebar-foreground/60">
									No notes found
								</div>
							) : (
								<SidebarMenu>
									{notesTree.map((note) => (
										<SidebarMenuItem
											key={note.id}
											className="group relative"
										>
											<SidebarMenuButton
												isActive={selectedNoteId === note.id}
												onClick={() => setSelectedNoteId(note.id)}
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
										variant={"default"}
									>
										Open in Editor
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
	);
}
