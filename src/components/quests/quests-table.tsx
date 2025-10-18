import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";

import type { Quest } from "~/api/types.gen";
import {
	ActionsDropdown,
	DateDisplay,
	EntityLink,
	EntityTable,
	type FilterConfig,
	SortableHeader,
	StatusDisplay,
	TagsDisplay,
} from "~/components/ui/composite/entity-table";
import { useDeleteQuestMutation } from "~/queries/quests";
import { EntityLinkButton } from "../links/entity-link-button";
import { EditQuestDialog } from "./edit-quest-dialog";

interface QuestsTableProps {
	data: Quest[];
	gameId: string;
}

function createQuestColumns(gameId: string): ColumnDef<Quest>[] {
	return [
		{
			accessorKey: "name",
			header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
			cell: ({ row }) => (
				<EntityLink
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
			cell: ({ row }) => <StatusDisplay status={row.getValue("status")} />,
		},
		{
			id: "actions",
			maxSize: 80,
			enableHiding: false,
			cell: ({ row }) => {
				const quest = row.original;
				const deleteQuest = useDeleteQuestMutation(gameId, quest.id);
				const [editModalOpen, setEditModalOpen] = React.useState(false);

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
							entity={quest}
							gameId={gameId}
							onEdit={() => setEditModalOpen(true)}
							onDelete={() => {
								deleteQuest.mutate({
									path: { game_id: gameId, id: quest.id },
								});
							}}
						/>
						<EditQuestDialog
							gameId={gameId}
							isOpen={editModalOpen}
							setIsOpen={setEditModalOpen}
							quest={quest}
						/>
					</div>
				);
			},
		},
	];
}

export function QuestsTable({ data, gameId }: QuestsTableProps) {
	const columns = createQuestColumns(gameId);

	const filters: FilterConfig[] = [
		{ type: "text" as const, columnId: "name", placeholder: "Filter names..." },
		{ type: "text" as const, columnId: "tags", placeholder: "Filter tags..." },
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
	];

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
			initialSort={[{ id: "updated_at", desc: true }]}
		/>
	);
}
