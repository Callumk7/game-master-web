import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";

import type { Faction } from "~/api/types.gen";
import {
	ActionsDropdown,
	DateDisplay,
	EntityLink,
	EntityTable,
	SortableHeader,
	TagsDisplay,
} from "~/components/ui/entity-table";
import { useDeleteFactionMutation } from "~/queries/factions";
import { EditFactionDialog } from "./edit-faction-dialog";

interface FactionsTableProps {
	data: Faction[];
	searchQuery: string;
	onSearchChange: (query: string) => void;
	tagFilter: string;
	onTagFilterChange: (tag: string) => void;
	gameId: string;
	paginationSize?: number;
	onPaginationSizeChange?: (size: number) => void;
}

function createFactionColumns(gameId: string): ColumnDef<Faction>[] {
	return [
		{
			accessorKey: "name",
			header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
			cell: ({ row }) => (
				<EntityLink
					entityType="faction"
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
			enableHiding: false,
			maxSize: 80,
			cell: ({ row }) => {
				const faction = row.original;
				const deleteFaction = useDeleteFactionMutation(gameId);
				const [editDialogOpen, setEditDialogOpen] = React.useState(false);

				return (
					<>
						<ActionsDropdown
							entityType="faction"
							entityName="faction"
							entity={faction}
							gameId={gameId}
							onEdit={() => setEditDialogOpen(true)}
							onDelete={() => {
								deleteFaction.mutate({
									path: { game_id: gameId, id: faction.id },
								});
							}}
						/>
						<EditFactionDialog
							isOpen={editDialogOpen}
							setIsOpen={setEditDialogOpen}
							faction={faction}
						/>
					</>
				);
			},
		},
	];
}

export function FactionsTable({
	data,
	searchQuery,
	onSearchChange,
	tagFilter,
	onTagFilterChange,
	gameId,
	paginationSize = 10,
	onPaginationSizeChange,
}: FactionsTableProps) {
	const columns = createFactionColumns(gameId);

	return (
		<EntityTable
			columns={columns}
			data={data}
			searchQuery={searchQuery}
			onSearchChange={onSearchChange}
			tagFilter={tagFilter}
			onTagFilterChange={onTagFilterChange}
			entityName="faction"
			searchPlaceholder="Filter names..."
			tagPlaceholder="Filter tags..."
			paginationSize={paginationSize}
			onPaginationSizeChange={onPaginationSizeChange}
			enableColumnVisibility={true}
			enablePaginationSizeSelector={true}
			columnRelativeWidths={{
				name: 2,
				actions: 0.5,
			}}
		/>
	);
}
