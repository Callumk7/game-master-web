import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";

import type { Quest } from "~/api/types.gen";
import {
	EntityTable,
	SortableHeader,
	EntityLink,
	TagsDisplay,
	DateDisplay,
	ContentDisplay,
	ActionsDropdown,
} from "~/components/ui/entity-table";
import { EditQuestDialog } from "./edit-quest-dialog";

interface QuestsTableProps {
	data: Quest[];
	searchQuery: string;
	onSearchChange: (query: string) => void;
	tagFilter: string;
	onTagFilterChange: (tag: string) => void;
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
			maxSize: 80,
			enableHiding: false,
			cell: ({ row }) => {
				const quest = row.original;
				const [editModalOpen, setEditModalOpen] = React.useState(false);

				return (
					<>
						<ActionsDropdown
							entityType="quest"
							entityName="quest"
							entity={quest}
							gameId={gameId}
							onEdit={() => setEditModalOpen(true)}
							showDelete={false}
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

export function QuestsTable({
	data,
	searchQuery,
	onSearchChange,
	tagFilter,
	onTagFilterChange,
	gameId,
}: QuestsTableProps) {
	const columns = createQuestColumns(gameId);

	return (
		<EntityTable
			columns={columns}
			data={data}
			searchQuery={searchQuery}
			onSearchChange={onSearchChange}
			tagFilter={tagFilter}
			onTagFilterChange={onTagFilterChange}
			entityName="quest"
			searchPlaceholder="Filter names..."
			tagPlaceholder="Filter tags..."
		/>
	);
}
