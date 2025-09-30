import type { ColumnDef } from "@tanstack/react-table";

import type { Character } from "~/api/types.gen";
import {
	ActionsDropdown,
	ContentDisplay,
	DateDisplay,
	EntityLink,
	EntityTable,
	SortableHeader,
	TagsDisplay,
} from "~/components/ui/entity-table";
import { useDeleteCharacterMutation } from "~/queries/characters";
import { Badge } from "../ui/badge";

interface CharacterTableProps {
	data: Character[];
	searchQuery: string;
	onSearchChange: (query: string) => void;
	tagFilter: string;
	onTagFilterChange: (tag: string) => void;
	gameId: string;
}

function createCharacterColumns(gameId: string): ColumnDef<Character>[] {
	return [
		{
			accessorKey: "name",
			header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
			cell: ({ row }) => (
				<EntityLink
					entityType="character"
					gameId={gameId}
					entityId={row.original.id}
					name={row.getValue("name")}
				/>
			),
		},
		{
			accessorKey: "class",
			header: "Class",
			cell: ({ row }) => (
				<Badge variant="secondary" className="capitalize">
					{row.getValue("class")}
				</Badge>
			),
		},
		{
			accessorKey: "level",
			header: ({ column }) => (
				<SortableHeader column={column}>Level</SortableHeader>
			),
			cell: ({ row }) => <div className="text-center">{row.getValue("level")}</div>,
			maxSize: 50,
		},
		{
			accessorKey: "content_plain_text",
			header: "Content",
			cell: ({ row }) => (
				<ContentDisplay
					content={row.getValue("content_plain_text")}
					maxWidth="max-w-xs"
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
			maxSize: 60,
			enableHiding: false,
			cell: ({ row }) => {
				const character = row.original;
				const deleteCharacter = useDeleteCharacterMutation(gameId);

				return (
					<ActionsDropdown
						entityType="character"
						entityName="character"
						entity={character}
						gameId={gameId}
						onDelete={() => {
							deleteCharacter.mutate({
								path: { id: character.id, game_id: gameId },
							});
						}}
					/>
				);
			},
		},
	];
}

export function CharacterTable({
	data,
	searchQuery,
	onSearchChange,
	tagFilter,
	onTagFilterChange,
	gameId,
}: CharacterTableProps) {
	const columns = createCharacterColumns(gameId);

	return (
		<EntityTable
			columns={columns}
			data={data}
			searchQuery={searchQuery}
			onSearchChange={onSearchChange}
			tagFilter={tagFilter}
			onTagFilterChange={onTagFilterChange}
			entityName="character"
			searchPlaceholder="Filter names..."
			tagPlaceholder="Filter tags..."
		/>
	);
}
