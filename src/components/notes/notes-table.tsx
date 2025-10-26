import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import type { Note } from "~/api/types.gen";
import {
	ActionsDropdown,
	DateDisplay,
	EntityTable,
	type FilterConfig,
	SortableHeader,
	TableLink,
	TagsDisplay,
} from "~/components/ui/composite/entity-table";
import { useDeleteNoteMutation } from "~/queries/notes";
import { useHandleEditNote } from "~/state/ui";
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
				const handleEdit = useHandleEditNote(note.id);

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
							onEdit={handleEdit}
							onDelete={() => {
								deleteNote.mutate({
									path: { game_id: gameId, id: note.id },
								});
							}}
							isPinned={note.pinned}
						/>
					</div>
				);
			},
		},
	];
}

export function NotesTable({ data, gameId }: NotesTableProps) {
	const columns = createNoteColumns(gameId);

	// Extract unique tags from all notes
	const allTags = React.useMemo(() => {
		const tagSet = new Set<string>();
		for (const note of data) {
			if (note.tags) {
				for (const tag of note.tags) {
					tagSet.add(tag);
				}
			}
		}
		return Array.from(tagSet).sort();
	}, [data]);

	// Configure filters
	const filters: FilterConfig[] = React.useMemo(
		() => [
			{ type: "text", columnId: "name", placeholder: "Filter names..." },
			{
				type: "multiselect",
				columnId: "tags",
				placeholder: "Filter tags...",
				options: allTags.map((tag) => ({ value: tag, label: tag })),
			},
		],
		[allTags],
	);

	return (
		<EntityTable
			columns={columns}
			data={data}
			entityName="note"
			filters={filters}
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
