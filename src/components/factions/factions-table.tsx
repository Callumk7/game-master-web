import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import type { Faction } from "~/api/types.gen";
import {
	ActionsDropdown,
	DateDisplay,
	EntityTable,
	type FilterConfig,
	SortableHeader,
	TableLink,
	TagsDisplay,
} from "~/components/ui/composite/entity-table";
import { useDeleteFactionMutation } from "~/queries/factions";
import { useHandleEditFaction } from "~/state/ui";
import { EntityLinkButton } from "../links/entity-link-button";

interface FactionsTableProps {
	data: Faction[];
	gameId: string;
}

function createFactionColumns(gameId: string): ColumnDef<Faction>[] {
	return [
		{
			accessorKey: "name",
			header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
			cell: ({ row }) => (
				<TableLink
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
			accessorKey: "updated_at",
			header: ({ column }) => (
				<SortableHeader column={column}>Updated</SortableHeader>
			),
			cell: ({ row }) => <DateDisplay date={row.getValue("updated_at")} />,
		},
		{
			id: "actions",
			enableHiding: false,
			cell: ({ row }) => {
				const faction = row.original;
				const deleteFaction = useDeleteFactionMutation(gameId, faction.id);
				const handleEdit = useHandleEditFaction(faction.id);

				return (
					<div className="flex gap-2 justify-end mr-2">
						<EntityLinkButton
							entity={{
								id: faction.id,
								name: faction.name,
								type: "faction",
								content: faction.content,
								content_plain_text: faction.content_plain_text,
							}}
						/>
						<ActionsDropdown
							entityType="faction"
							entityName="faction"
							entity={{
								id: faction.id,
								name: faction.name,
								type: "faction",
								content: faction.content,
								content_plain_text: faction.content_plain_text,
							}}
							gameId={gameId}
							onEdit={handleEdit}
							onDelete={() => {
								deleteFaction.mutate({
									path: { game_id: gameId, id: faction.id },
								});
							}}
						/>
					</div>
				);
			},
		},
	];
}

export function FactionsTable({ data, gameId }: FactionsTableProps) {
	const columns = createFactionColumns(gameId);

	// Extract unique tags from all factions
	const allTags = React.useMemo(() => {
		const tagSet = new Set<string>();
		for (const faction of data) {
			if (faction.tags) {
				for (const tag of faction.tags) {
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
			entityName="faction"
			filters={filters}
			enableColumnVisibility={true}
			enablePaginationSizeSelector={true}
			columnRelativeWidths={{
				name: 1.5,
				actions: 0.7,
				updated_at: 0.5,
			}}
			initialSort={[{ id: "updated_at", desc: true }]}
		/>
	);
}
