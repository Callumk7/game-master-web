import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import type { Quest } from "~/api/types.gen";
import {
	ActionsDropdown,
	DateDisplay,
	EntityTable,
	type FilterConfig,
	SortableHeader,
	StatusDisplay,
	TableLink,
	TagsDisplay,
} from "~/components/ui/composite/entity-table";
import { useDeleteQuestMutation } from "~/queries/quests";
import { useHandleEditQuest } from "~/state/ui";
import { EntityLinkButton } from "../links/entity-link-button";

interface QuestsTableProps {
	data: Quest[];
	gameId: string;
}

// Define custom status sort order
const statusOrder: Record<string, number> = {
	active: 0,
	paused: 1,
	ready: 2,
	preparing: 3,
	completed: 4,
	cancelled: 5,
};

function createQuestColumns(gameId: string): ColumnDef<Quest>[] {
	return [
		{
			accessorKey: "name",
			header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
			cell: ({ row }) => (
				<TableLink
					entityType="quest"
					quest-table
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
			accessorKey: "status",
			header: ({ column }) => (
				<SortableHeader column={column}>Status</SortableHeader>
			),
			sortingFn: (rowA, rowB) => {
				const statusA = rowA.getValue("status") as string;
				const statusB = rowB.getValue("status") as string;
				const orderA = statusOrder[statusA] ?? 999;
				const orderB = statusOrder[statusB] ?? 999;
				return orderA - orderB;
			},
			cell: ({ row }) => <StatusDisplay status={row.getValue("status")} />,
		},
		{
			id: "actions",
			maxSize: 80,
			enableHiding: false,
			cell: ({ row }) => {
				const quest = row.original;
				const deleteQuest = useDeleteQuestMutation(gameId, quest.id);
				const handleEdit = useHandleEditQuest(quest.id);

				return (
					<div className="flex gap-2 justify-end mr-2">
						<EntityLinkButton
							entity={{
								id: quest.id,
								name: quest.name,
								type: "quest",
								content: quest.content,
								content_plain_text: quest.content_plain_text,
							}}
						/>
						<ActionsDropdown
							entityType="quest"
							entityName="quest"
							entity={{
								id: quest.id,
								name: quest.name,
								type: "quest",
								content: quest.content,
								content_plain_text: quest.content_plain_text,
							}}
							gameId={gameId}
							onEdit={handleEdit}
							onDelete={() => {
								deleteQuest.mutate({
									path: { game_id: gameId, id: quest.id },
								});
							}}
						/>
					</div>
				);
			},
		},
	];
}

export function QuestsTable({ data, gameId }: QuestsTableProps) {
	const columns = createQuestColumns(gameId);

	// Extract unique tags from all quests
	const allTags = React.useMemo(() => {
		const tagSet = new Set<string>();
		for (const quest of data) {
			if (quest.tags) {
				for (const tag of quest.tags) {
					tagSet.add(tag);
				}
			}
		}
		return Array.from(tagSet).sort();
	}, [data]);

	const filters: FilterConfig[] = React.useMemo(
		() => [
			{ type: "text" as const, columnId: "name", placeholder: "Filter names..." },
			{
				type: "multiselect" as const,
				columnId: "tags",
				placeholder: "Filter tags...",
				options: allTags.map((tag) => ({ value: tag, label: tag })),
			},
			{
				type: "select" as const,
				columnId: "status",
				placeholder: "All statuses",
				options: [
					{ value: "preparing", label: "Preparing" },
					{ value: "ready", label: "Ready" },
					{ value: "active", label: "Active" },
					{ value: "paused", label: "Paused" },
					{ value: "completed", label: "Completed" },
					{ value: "cancelled", label: "Cancelled" },
				],
			},
		],
		[allTags],
	);

	return (
		<EntityTable
			columns={columns}
			data={data}
			entityName="quest"
			filters={filters}
			enableColumnVisibility={true}
			enablePaginationSizeSelector={true}
			columnRelativeWidths={{
				name: 1.2,
				updated_at: 0.6,
				status: 0.6,
				actions: 0.6,
			}}
			initialSort={[
				{ id: "status", desc: false },
				{ id: "updated_at", desc: true },
			]}
		/>
	);
}
