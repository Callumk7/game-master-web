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
} from "~/components/ui/entity-table";
import { EditNoteDialog } from "./edit-note-dialog";

interface NotesTableProps {
	data: Note[];
	searchQuery: string;
	onSearchChange: (query: string) => void;
	tagFilter: string;
	onTagFilterChange: (tag: string) => void;
	gameId: string;
	paginationSize?: number;
	onPaginationSizeChange?: (size: number) => void;
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
			id: "actions",
			maxSize: 60,
			enableHiding: false,
			cell: ({ row }) => {
				const note = row.original;
				const [editModalOpen, setEditModalOpen] = React.useState(false);

				return (
					<>
						<ActionsDropdown
							entityType="note"
							entityName="note"
							entity={note}
							gameId={gameId}
							onEdit={() => setEditModalOpen(true)}
							showDelete={false}
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

export function NotesTable({
	data,
	searchQuery,
	onSearchChange,
	tagFilter,
	onTagFilterChange,
	gameId,
	paginationSize = 10,
	onPaginationSizeChange,
}: NotesTableProps) {
	const columns = createNoteColumns(gameId);

	return (
		<EntityTable
			columns={columns}
			data={data}
			searchQuery={searchQuery}
			onSearchChange={onSearchChange}
			tagFilter={tagFilter}
			onTagFilterChange={onTagFilterChange}
			entityName="note"
			searchPlaceholder="Filter names..."
			tagPlaceholder="Filter tags..."
			paginationSize={paginationSize}
			onPaginationSizeChange={onPaginationSizeChange}
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
