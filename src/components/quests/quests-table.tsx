import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";

import type { Quest } from "~/api/types.gen";
import {
	ActionsDropdown,
	ContentDisplay,
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
					gameId={gameId}
					entityId={row.original.id}
					name={row.getValue("name")}
				/>
			),
		},
		{
			accessorKey: "content_plain_text",
			header: "Content",
			cell: ({ row }) => (
				<ContentDisplay
					content={row.getValue("content_plain_text")}
					maxWidth="max-w-[300px]"
					placeholder="No content"
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
			accessorKey: "status",
			header: ({ column }) => (
				<SortableHeader column={column}>Status</SortableHeader>
			),
			cell: ({ row }) => <StatusDisplay status={row.getValue("status")} />,
		},
		{
			id: "view",
			header: "View",
			maxSize: 60,
			enableHiding: false,
			cell: ({ row }) => {
				const quest = row.original;
				return (
					<EntityLinkButton
						entity={{
							id: quest.id,
							name: quest.name,
							type: "quest",
							content: quest.content,
							content_plain_text: quest.content_plain_text,
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
				const quest = row.original;
				const deleteQuest = useDeleteQuestMutation(gameId, quest.id);
				const [editModalOpen, setEditModalOpen] = React.useState(false);

				return (
					<>
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
							isOpen={editModalOpen}
							setIsOpen={setEditModalOpen}
							quest={quest}
						/>
					</>
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
				name: 2,
				actions: 0.5,
				content_plain_text: 2,
			}}
		/>
	);
}
