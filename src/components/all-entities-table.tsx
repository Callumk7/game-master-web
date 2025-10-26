import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	ActionsDropdown,
	ContentDisplay,
	DateDisplay,
	EntityTable,
	type FilterConfig,
	SortableHeader,
	TableLink,
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
import { useHandleEditEntity } from "~/state/ui";
import type { EntityType } from "~/types";
import { EntityLinkButton } from "./links/entity-link-button";

export type AllEntity = {
	id: string;
	name: string;
	type: EntityType;
	content?: string;
	content_plain_text?: string;
	tags?: string[];
	created_at?: string;
	updated_at?: string;
	pinned?: boolean;
	// Character specific
	class?: string;
	level?: number;
	faction_role?: string;
	race?: string;
	// Quest / Location specific
	// Quest specific
	status?: string;
	parent_id?: string;
	// Location specific
	locationType?: string;
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
				<div className="flex flex-col">
					<TableLink
						entityType={row.original.type}
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
			accessorKey: "content_plain_text",
			header: "Content",
			cell: ({ row }) => (
				<ContentDisplay
					content={row.getValue("content_plain_text")}
					maxWidth="max-w-md"
					placeholder="No description"
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
				const entity = row.original;
				return <EntityControls gameId={gameId} entity={entity} />;
			},
		},
	];

	const uniqueTypes = React.useMemo(() => {
		const types = [...new Set(entities.map((entity) => entity.type))];
		return types.sort();
	}, [entities]);

	// Extract unique tags from all entities
	const allTags = React.useMemo(() => {
		const tagSet = new Set<string>();
		for (const entity of filteredEntities) {
			if (entity.tags) {
				for (const tag of entity.tags) {
					tagSet.add(tag);
				}
			}
		}
		return Array.from(tagSet).sort();
	}, [filteredEntities]);

	// Configure filters
	const filters: FilterConfig[] = React.useMemo(
		() => [
			{ type: "text", columnId: "name", placeholder: "Search entities..." },
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
				filters={filters}
				enableColumnVisibility={true}
				enablePaginationSizeSelector={true}
				defaultHidden={["content_plain_text"]}
				columnRelativeWidths={{
					name: 1.4,
					actions: 0.6,
					updated_at: 0.6,
				}}
				initialSort={[{ id: "updated_at", desc: true }]}
			/>
		</div>
	);
}

// === Entity Controls ===
interface EntityControlsProps {
	gameId: string;
	entity: AllEntity;
}

function EntityControls({ gameId, entity }: EntityControlsProps) {
	const handleEdit = useHandleEditEntity(entity.id, entity.type);
	return (
		<div className="flex gap-2 justify-end mr-2">
			<EntityLinkButton entity={entity} />
			<ActionsDropdown
				entityType={entity.type}
				entityName={entity.type}
				entity={entity}
				isPinned={entity.pinned}
				onEdit={handleEdit}
				gameId={gameId}
			/>
		</div>
	);
}
