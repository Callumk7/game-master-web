import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";

import type { Note } from "~/api/types.gen";
import {
	ActionsDropdown,
	DateDisplay,
	EntityTable,
	SortableHeader,
	TableLink,
	TagsDisplay,
} from "~/components/ui/composite/entity-table";
import { useDeleteNoteMutation } from "~/queries/notes";
import { EntityLinkButton } from "../links/entity-link-button";
import { EditNoteDialog } from "./edit-note-dialog";

interface NotesTableProps {
	data: Note[];
	gameId: string;
}

function createNoteColumns(gameId: string): ColumnDef<Note>[] {
	return [
		{
			accessorKey: "name",
			header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
			cell: ({ row }) => (
				<TableLink
					entityType="note"
					gameId={gameId}
					entityId={row.original.id}
					name={row.getValue("name")}
				/>
			),
		},
		{
			accessorKey: "tags",
			header: "Tags",
			filterFn: "fuzzy",
			cell: ({ row }) => <TagsDisplay tags={row.getValue("tags")} />,
		},
		{
			accessorKey: "updated_at",
			header: ({ column }) => (
				<SortableHeader column={column}>Updated</SortableHeader>
			),
			cell: ({ row }) => <DateDisplay date={row.getValue("updated_at")} />,
		},
		{
			id: "actions",
			maxSize: 60,
			enableHiding: false,
			cell: ({ row }) => {
				const note = row.original;
				const deleteNote = useDeleteNoteMutation(gameId, note.id);
				const [editModalOpen, setEditModalOpen] = React.useState(false);

				return (
					<div className="flex gap-2 justify-end mr-2">
						<EntityLinkButton
							entity={{
								id: note.id,
								name: note.name,
								type: "note",
								content: note.content,
								content_plain_text: note.content_plain_text,
							}}
						/>
						<ActionsDropdown
							entityType="note"
							entityName="note"
							entity={{
								id: note.id,
								name: note.name,
								type: "note",
								content: note.content,
								content_plain_text: note.content_plain_text,
							}}
							gameId={gameId}
							onEdit={() => setEditModalOpen(true)}
							onDelete={() => {
								deleteNote.mutate({
									path: { game_id: gameId, id: note.id },
								});
							}}
							isPinned={note.pinned}
						/>
						<EditNoteDialog
							gameId={gameId}
							isOpen={editModalOpen}
							setIsOpen={setEditModalOpen}
							note={note}
						/>
					</div>
				);
			},
		},
	];
}

export function NotesTable({ data, gameId }: NotesTableProps) {
	const columns = createNoteColumns(gameId);

	return (
		<EntityTable
			columns={columns}
			data={data}
			entityName="note"
			searchPlaceholder="Filter names..."
			tagPlaceholder="Filter tags..."
			enableColumnVisibility={true}
			enablePaginationSizeSelector={true}
			columnRelativeWidths={{
				name: 1.5,
				actions: 0.6,
				updated_at: 0.6,
			}}
			initialSort={[{ id: "updated_at", desc: true }]}
		/>
	);
}
