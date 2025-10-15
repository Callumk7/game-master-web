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
} from "~/components/ui/composite/entity-table";
import { useDeleteLocationMutation } from "~/queries/locations";
import { EntityLinkButton } from "../links/entity-link-button";
import { Badge } from "../ui/badge";
import { EditLocationDialog } from "./edit-location-dialog";

interface LocationsTableProps {
	data: Location[];
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
			id: "view",
			header: "View",
			maxSize: 60,
			enableHiding: false,
			cell: ({ row }) => {
				const location = row.original;
				return (
					<EntityLinkButton
						entity={{
							id: location.id,
							name: location.name,
							type: "location",
							content: location.content,
							content_plain_text: location.content_plain_text,
						}}
					/>
				);
			},
		},
		{
			id: "actions",
			maxSize: 80,
			enableHiding: false,
			cell: ({ row }) => {
				const location = row.original;
				const deleteLocation = useDeleteLocationMutation(gameId, location.id);
				const [editModalOpen, setEditModalOpen] = React.useState(false);

				return (
					<>
						<ActionsDropdown
							entityType="location"
							entityName="location"
							entity={location}
							gameId={gameId}
							onEdit={() => setEditModalOpen(true)}
							onDelete={() => {
								deleteLocation.mutate({
									path: { game_id: gameId, id: location.id },
								});
							}}
						/>
						<EditLocationDialog
							gameId={gameId}
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

export function LocationsTable({ data, gameId }: LocationsTableProps) {
	const columns = createLocationColumns(gameId);

	return (
		<EntityTable
			columns={columns}
			data={data}
			entityName="location"
			searchPlaceholder="Filter names..."
			tagPlaceholder="Filter tags..."
			enableColumnVisibility={true}
			enablePaginationSizeSelector={true}
			columnRelativeWidths={{
				name: 1.2,
				actions: 0.5,
				type: 0.6,
				updated_at: 0.6,
			}}
		/>
	);
}
