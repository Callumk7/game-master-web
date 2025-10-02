import { useMutation } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import type { Note } from "~/api";
import { updateNoteMutation, useListNotesQuery } from "~/api/@tanstack/react-query.gen";
import { Button } from "../ui/button";
import {
	Combobox,
	ComboboxClear,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxItemIndicator,
	ComboboxList,
	ComboboxPopup,
	ComboboxPositioner,
	ComboboxTrigger,
} from "../ui/combobox";
import { Label } from "../ui/label";
import {
	Popover,
	PopoverContent,
	PopoverPositioner,
	PopoverTrigger,
} from "../ui/popover";

interface SelectNoteComboboxProps {
	gameId: string;
	characterId: string;
}

export function SelectNoteCombobox({ gameId, characterId }: SelectNoteComboboxProps) {
	const id = React.useId();
	const [selectedNote, setSelectedNote] = React.useState<Note | null>(null);

	const { data: notesData } = useListNotesQuery({ path: { game_id: gameId } });
	const notes = notesData?.data ?? [];

	const updateNote = useMutation(updateNoteMutation());

	const handleLink = () => {
		if (selectedNote) {
			updateNote.mutateAsync({
				path: { game_id: gameId, id: selectedNote.id },
				body: {
					note: {
						parent_id: characterId,
						parent_type: "character",
					},
				},
			});
		}
	};

	return (
		<Popover>
			<PopoverTrigger render={<Button />}>Link existing note</PopoverTrigger>
			<PopoverPositioner align="start" side="bottom">
				<PopoverContent>
					<div className="space-y-2">
						<div className="space-y-1">
							<Label>Select a note</Label>
							<Combobox
								items={notes}
								value={selectedNote}
								onValueChange={(note) => setSelectedNote(note)}
								itemToStringLabel={(note) => note.name}
							>
								<div className="relative flex flex-col gap-2">
									<ComboboxInput placeholder="Select a note" id={id} />
									<div className="absolute right-2 bottom-0 flex h-9 items-center justify-center text-muted-foreground">
										<ComboboxClear />
										<ComboboxTrigger
											className="h-9 w-6 text-muted-foreground shadow-none bg-transparent hover:bg-transparent border-none"
											aria-label="Open popup"
										>
											<ChevronDown className="size-4" />
										</ComboboxTrigger>
									</div>
								</div>

								<ComboboxPositioner>
									<ComboboxPopup>
										<ComboboxEmpty>No notes found.</ComboboxEmpty>
										<ComboboxList>
											{(note) => (
												<ComboboxItem key={note.id} value={note}>
													<ComboboxItemIndicator />
													<div className="col-start-2">
														{note.name}
													</div>
												</ComboboxItem>
											)}
										</ComboboxList>
									</ComboboxPopup>
								</ComboboxPositioner>
							</Combobox>
						</div>

						<Button onClick={handleLink}>Link</Button>
					</div>
				</PopoverContent>
			</PopoverPositioner>
		</Popover>
	);
}
