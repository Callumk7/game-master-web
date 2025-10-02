import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";

import type { Location } from "~/api/types.gen";
import {
	ActionsDropdown,
	DateDisplay,
	EntityLink,
	EntityTable,
	SortableHeader,
	TagsDisplay,
} from "~/components/ui/entity-table";
import { Badge } from "../ui/badge";
import { EditLocationDialog } from "./edit-location-dialog";

interface LocationsTableProps {
	data: Location[];
	searchQuery: string;
	onSearchChange: (query: string) => void;
	tagFilter: string;
	onTagFilterChange: (tag: string) => void;
	gameId: string;
	paginationSize?: number;
	onPaginationSizeChange?: (size: number) => void;
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
			maxSize: 80,
			enableHiding: false,
			cell: ({ row }) => {
				const location = row.original;
				const [editModalOpen, setEditModalOpen] = React.useState(false);

				return (
					<>
						<ActionsDropdown
							entityType="location"
							entityName="location"
							entity={location}
							gameId={gameId}
							onEdit={() => setEditModalOpen(true)}
							showDelete={false}
						/>
						<EditLocationDialog
							isOpen={editModalOpen}
							setIsOpen={setEditModalOpen}
							location={location}
						/>
					</>
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
	paginationSize = 10,
	onPaginationSizeChange,
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
			paginationSize={paginationSize}
			onPaginationSizeChange={onPaginationSizeChange}
			enableColumnVisibility={true}
			enablePaginationSizeSelector={true}
			columnRelativeWidths={{
				name: 1.2,
				actions: 0.5,
				type: 0.6,
				created_at: 0.6,
			}}
		/>
	);
}
