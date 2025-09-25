import type { ColumnDef } from "@tanstack/react-table";

import type { Note } from "~/api/types.gen";
import {
	ActionsDropdown,
	DateDisplay,
	EntityLink,
	EntityTable,
	SortableHeader,
	TagsDisplay,
} from "~/components/ui/entity-table";

interface NotesTableProps {
	data: Note[];
	searchQuery: string;
	onSearchChange: (query: string) => void;
	tagFilter: string;
	onTagFilterChange: (tag: string) => void;
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
			filterFn: (row, columnId, value) => {
				if (!value) return true;
				const tags = row.getValue(columnId) as string[];
				return (
					tags?.some((tag) =>
						tag.toLowerCase().includes(value.toLowerCase()),
					) ?? false
				);
			},
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
			enableHiding: false,
			cell: ({ row }) => {
				const note = row.original;

				return (
					<ActionsDropdown
						entityType="note"
						entityName="note"
						entity={note}
						gameId={gameId}
						showDelete={false} // No delete mutation available in original
					/>
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
		/>
	);
}
