import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	ContentDisplay,
	DateDisplay,
	EntityLink,
	EntityTable,
	SortableHeader,
	TagsDisplay,
} from "~/components/ui/composite/entity-table";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuPortal,
	DropdownMenuPositioner,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { EntityType } from "~/types";
import { EntityLinkControls } from "./links/entity-link-controls";

export type AllEntity = {
	id: string;
	name: string;
	type: EntityType;
	content?: string;
	content_plain_text?: string;
	tags?: string[];
	created_at?: string;
	updated_at?: string;
	// Character specific
	class?: string;
	level?: number;
	faction_role?: string;
	// Quest specific
	parent_id?: string;
};

interface AllEntitiesTableProps {
	entities: AllEntity[];
	gameId: string;
}

export function AllEntitiesTable({ entities, gameId }: AllEntitiesTableProps) {
	const [typeFilter, setTypeFilter] = React.useState<string>("all");

	// Filter entities by type before passing to EntityTable
	const filteredEntities = React.useMemo(() => {
		if (typeFilter === "all") return entities;
		return entities.filter((entity) => entity.type === typeFilter);
	}, [entities, typeFilter]);

	const columns: ColumnDef<AllEntity>[] = [
		{
			accessorKey: "name",
			header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
			cell: ({ row }) => (
				<EntityLink
					entityType={row.original.type}
					gameId={gameId}
					entityId={row.original.id}
					name={row.getValue("name")}
				/>
			),
			size: 200,
		},
		{
			accessorKey: "type",
			header: "Type",
			cell: ({ row }) => (
				<Badge variant="secondary" className="capitalize">
					{row.getValue("type")}
				</Badge>
			),
			size: 100,
		},
		{
			accessorKey: "content_plain_text",
			header: "Content",
			cell: ({ row }) => (
				<ContentDisplay
					content={row.getValue("content_plain_text")}
					maxWidth="max-w-md"
					placeholder="No description"
				/>
			),
			size: 300,
		},
		{
			accessorKey: "tags",
			header: "Tags",
			filterFn: "fuzzy",
			cell: ({ row }) => <TagsDisplay tags={row.getValue("tags")} />,
			size: 150,
		},
		{
			accessorKey: "updated_at",
			header: ({ column }) => (
				<SortableHeader column={column}>Last Updated</SortableHeader>
			),
			cell: ({ row }) => <DateDisplay date={row.getValue("updated_at")} />,
			size: 120,
		},
		{
			id: "view",
			header: "View",
			enableHiding: false,
			cell: ({ row }) => {
				const entity = row.original;
				return (
					<EntityLinkControls
						gameId={gameId}
						sourceId={entity.id}
						sourceType={entity.type}
						link={entity}
					/>
				);
			},
			size: 60,
		},
	];

	const uniqueTypes = React.useMemo(() => {
		const types = [...new Set(entities.map((entity) => entity.type))];
		return types.sort();
	}, [entities]);

	return (
		<div className="w-full max-w-full">
			<div className="flex items-center gap-4 py-4 mb-4">
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button variant="outline">
								Type: {typeFilter === "all" ? "All" : typeFilter}
								<ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						}
					></DropdownMenuTrigger>
					<DropdownMenuPortal>
						<DropdownMenuPositioner>
							<DropdownMenuContent>
								<DropdownMenuCheckboxItem
									checked={typeFilter === "all"}
									onCheckedChange={() => setTypeFilter("all")}
								>
									All Types
								</DropdownMenuCheckboxItem>
								{uniqueTypes.map((type) => (
									<DropdownMenuCheckboxItem
										key={type}
										checked={typeFilter === type}
										onCheckedChange={() => setTypeFilter(type)}
										className="capitalize"
									>
										{type}
									</DropdownMenuCheckboxItem>
								))}
							</DropdownMenuContent>
						</DropdownMenuPositioner>
					</DropdownMenuPortal>
				</DropdownMenu>
			</div>
			<EntityTable
				columns={columns}
				data={filteredEntities}
				entityName="entity"
				searchPlaceholder="Search entities..."
				tagPlaceholder="Filter tags..."
				enableColumnVisibility={true}
				enablePaginationSizeSelector={true}
				defaultHidden={["content_plain_text"]}
				columnRelativeWidths={{
					name: 2,
				}}
			/>
		</div>
	);
}
