import type { ColumnDef } from "@tanstack/react-table";

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

interface FactionsTableProps {
	data: Faction[];
	searchQuery: string;
	onSearchChange: (query: string) => void;
	tagFilter: string;
	onTagFilterChange: (tag: string) => void;
	gameId: string;
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
			maxSize: 80,
			cell: ({ row }) => {
				const faction = row.original;
				const deleteFaction = useDeleteFactionMutation(gameId);

				return (
					<ActionsDropdown
						entityType="faction"
						entityName="faction"
						entity={faction}
						gameId={gameId}
						onDelete={() => {
							deleteFaction.mutate({
								path: { game_id: gameId, id: faction.id },
							});
						}}
					/>
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
		/>
	);
}
