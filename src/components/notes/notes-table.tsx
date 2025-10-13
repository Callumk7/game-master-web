import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";

import type { Note } from "~/api/types.gen";
import {
	ActionsDropdown,
	DateDisplay,
	EntityLink,
	EntityTable,
	SortableHeader,
	TagsDisplay,
} from "~/components/ui/composite/entity-table";
import { useDeleteNoteMutation } from "~/queries/notes";
import { EditNoteDialog } from "./edit-note-dialog";
import { EntityLinkButton } from "../links/entity-link-button";

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
				<EntityLink
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
			accessorKey: "created_at",
			header: ({ column }) => (
				<SortableHeader column={column}>Created</SortableHeader>
			),
			cell: ({ row }) => <DateDisplay date={row.getValue("created_at")} />,
		},
		{
			id: "view",
			header: "View",
			maxSize: 60,
			enableHiding: false,
			cell: ({ row }) => {
				const note = row.original;
				return (
					<EntityLinkButton
						entity={{
							id: note.id,
							name: note.name,
							type: "note",
							content: note.content,
							content_plain_text: note.content_plain_text,
						}}
					/>
				);
			},
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
					<>
						<ActionsDropdown
							entityType="note"
							entityName="note"
							entity={note}
							gameId={gameId}
							onEdit={() => setEditModalOpen(true)}
							onDelete={() => {
								deleteNote.mutate({
									path: { game_id: gameId, id: note.id },
								});
							}}
						/>
						<EditNoteDialog
							isOpen={editModalOpen}
							setIsOpen={setEditModalOpen}
							note={note}
						/>
					</>
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
				name: 2,
				actions: 0.5,
				created_at: 0.5,
			}}
		/>
	);
}
