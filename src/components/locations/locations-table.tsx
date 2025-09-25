import type { ColumnDef } from "@tanstack/react-table";

import type { Location } from "~/api/types.gen";
import {
	EntityTable,
	SortableHeader,
	EntityLink,
	TagsDisplay,
	DateDisplay,
	ActionsDropdown,
} from "~/components/ui/entity-table";
import { Badge } from "../ui/badge";

interface LocationsTableProps {
	data: Location[];
	searchQuery: string;
	onSearchChange: (query: string) => void;
	tagFilter: string;
	onTagFilterChange: (tag: string) => void;
	gameId: string;
}

function createLocationColumns(gameId: string): ColumnDef<Location>[] {
	return [
		{
			accessorKey: "name",
			header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
			cell: ({ row }) => (
				<EntityLink
					entityType="location"
					gameId={gameId}
					entityId={row.original.id}
					name={row.getValue("name")}
				/>
			),
		},
		{
			accessorKey: "type",
			header: "Type",
			cell: ({ row }) => (
				<Badge variant="secondary" className="capitalize">
					{row.getValue("type")}
				</Badge>
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
				const location = row.original;

				return (
					<ActionsDropdown
						entityType="location"
						entityName="location"
						entity={location}
						gameId={gameId}
						showDelete={false} // No delete mutation available in original
					/>
				);
			},
		},
	];
}

export function LocationsTable({
	data,
	searchQuery,
	onSearchChange,
	tagFilter,
	onTagFilterChange,
	gameId,
}: LocationsTableProps) {
	const columns = createLocationColumns(gameId);

	return (
		<EntityTable
			columns={columns}
			data={data}
			searchQuery={searchQuery}
			onSearchChange={onSearchChange}
			tagFilter={tagFilter}
			onTagFilterChange={onTagFilterChange}
			entityName="location"
			searchPlaceholder="Filter names..."
			tagPlaceholder="Filter tags..."
		/>
	);
}
