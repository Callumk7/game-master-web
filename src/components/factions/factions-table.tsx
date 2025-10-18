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
} from "~/components/ui/composite/entity-table";
import { useDeleteFactionMutation } from "~/queries/factions";
import { EntityLinkButton } from "../links/entity-link-button";
import { EditFactionDialog } from "./edit-faction-dialog";

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
				const [editDialogOpen, setEditDialogOpen] = React.useState(false);

				return (
					<div className="flex flex-row gap-2">
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
							gameId={gameId}
							isOpen={editDialogOpen}
							setIsOpen={setEditDialogOpen}
							faction={faction}
						/>
					</div>
				);
			},
		},
	];
}

export function FactionsTable({ data, gameId }: FactionsTableProps) {
	const columns = createFactionColumns(gameId);

	return (
		<EntityTable
			columns={columns}
			data={data}
			entityName="faction"
			searchPlaceholder="Filter names..."
			tagPlaceholder="Filter tags..."
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
