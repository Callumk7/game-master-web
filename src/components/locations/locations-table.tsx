import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import type { Location } from "~/api/types.gen";
import {
	ActionsDropdown,
	DateDisplay,
	EntityTable,
	type FilterConfig,
	SortableHeader,
	TableLink,
	TagsDisplay,
} from "~/components/ui/composite/entity-table";
import { useDeleteLocationMutation } from "~/queries/locations";
import { useHandleEditLocation } from "~/state/ui";
import { EntityLinkButton } from "../links/entity-link-button";
import { Badge } from "../ui/badge";

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
				<div className="flex flex-col">
					<TableLink
						entityType="location"
						gameId={gameId}
						entityId={row.original.id}
						name={row.getValue("name")}
					/>
					<Badge variant="secondary" className="capitalize mb-1">
						{row.original.type}
					</Badge>
				</div>
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
				const location = row.original;
				const deleteLocation = useDeleteLocationMutation(gameId, location.id);
				const handleEdit = useHandleEditLocation(location.id);

				return (
					<div className="flex gap-2 justify-end mr-2">
						<EntityLinkButton
							entity={{
								id: location.id,
								name: location.name,
								type: "location",
								content: location.content,
								content_plain_text: location.content_plain_text,
							}}
						/>
						<ActionsDropdown
							entityType="location"
							entityName="location"
							entity={{
								id: location.id,
								name: location.name,
								type: "location",
								content: location.content,
								content_plain_text: location.content_plain_text,
							}}
							gameId={gameId}
							onEdit={handleEdit}
							onDelete={() => {
								deleteLocation.mutate({
									path: { game_id: gameId, id: location.id },
								});
							}}
						/>
					</div>
				);
			},
		},
	];
}

export function LocationsTable({ data, gameId }: LocationsTableProps) {
	const columns = createLocationColumns(gameId);

	// Extract unique tags from all locations
	const allTags = React.useMemo(() => {
		const tagSet = new Set<string>();
		for (const location of data) {
			if (location.tags) {
				for (const tag of location.tags) {
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
			entityName="location"
			filters={filters}
			enableColumnVisibility={true}
			enablePaginationSizeSelector={true}
			columnRelativeWidths={{
				actions: 0.6,
				updated_at: 0.6,
			}}
			initialSort={[{ id: "updated_at", desc: true }]}
		/>
	);
}
