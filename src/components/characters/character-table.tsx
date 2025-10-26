import type { ColumnDef } from "@tanstack/react-table";
import { Check, Cross } from "lucide-react";
import * as React from "react";
import type { Character } from "~/api/types.gen";
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
import { useDeleteCharacterMutation } from "~/queries/characters";
import { useHandleEditCharacter } from "~/state/ui";
import { EntityLinkButton } from "../links/entity-link-button";
import { Badge } from "../ui/badge";

interface CharacterTableProps {
	data: Character[];
	gameId: string;
}

function createCharacterColumns(gameId: string): ColumnDef<Character>[] {
	return [
		{
			accessorKey: "name",
			header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
			minSize: 200,
			cell: ({ row }) => (
				<div className="flex flex-col w-full">
					<TableLink
						entityType="character"
						gameId={gameId}
						entityId={row.original.id}
						name={row.getValue("name")}
					/>
					<Badge variant="secondary" className="capitalize mb-1">
						{row.original.class}
					</Badge>
				</div>
			),
		},
		{
			accessorKey: "level",
			header: ({ column }) => (
				<SortableHeader column={column}>Level</SortableHeader>
			),
			cell: ({ row }) => <div className="text-center">{row.getValue("level")}</div>,
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
			filterFn: "fuzzy",
			cell: ({ row }) => <TagsDisplay tags={row.getValue("tags")} />,
		},
		{
			accessorKey: "alive",
			header: "Alive",
			cell: ({ row }) => (
				<div>
					{row.getValue("alive") ? (
						<Check className="size-3 ml-2 text-success-foreground" />
					) : (
						<Cross className="size-3 ml-2 text-destructive" />
					)}
				</div>
			),
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
				const character = row.original;
				const deleteCharacter = useDeleteCharacterMutation(gameId, character.id);
				const handleEdit = useHandleEditCharacter(character.id);

				return (
					<div className="flex gap-2 justify-end mr-2">
						<EntityLinkButton
							entity={{
								id: character.id,
								name: character.name,
								type: "character",
								content: character.content,
								content_plain_text: character.content_plain_text,
							}}
						/>
						<ActionsDropdown
							entityType="character"
							entityName="character"
							entity={{
								id: character.id,
								name: character.name,
								type: "character",
								content: character.content,
								content_plain_text: character.content_plain_text,
							}}
							gameId={gameId}
							onDelete={() => {
								deleteCharacter.mutate({
									path: { id: character.id, game_id: gameId },
								});
							}}
							onEdit={handleEdit}
							isPinned={character.pinned}
						/>
					</div>
				);
			},
		},
	];
}

export function CharacterTable({ data, gameId }: CharacterTableProps) {
	const columns = createCharacterColumns(gameId);

	// Extract unique tags from all characters
	const allTags = React.useMemo(() => {
		const tagSet = new Set<string>();
		for (const character of data) {
			if (character.tags) {
				for (const tag of character.tags) {
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
			entityName="character"
			filters={filters}
			enableColumnVisibility={true}
			enablePaginationSizeSelector={true}
			columnRelativeWidths={{
				actions: 0.6,
				alive: 0.6,
				level: 0.6,
				tags: 1,
				name: 1.4,
			}}
			defaultHidden={["content_plain_text"]}
			initialSort={[{ id: "updated_at", desc: true }]}
		/>
	);
}
