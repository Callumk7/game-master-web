import type { ColumnDef } from "@tanstack/react-table";
import { Check, Cross } from "lucide-react";
import * as React from "react";
import type { Character } from "~/api/types.gen";
import {
	ActionsDropdown,
	ContentDisplay,
	DateDisplay,
	EntityLink,
	EntityTable,
	SortableHeader,
	TagsDisplay,
} from "~/components/ui/composite/entity-table";
import { useDeleteCharacterMutation } from "~/queries/characters";
import { EntityLinkButton } from "../links/entity-link-button";
import { Badge } from "../ui/badge";
import { EditCharacterDialog } from "./edit-character-dialog";

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
					<EntityLink
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
						<Check className="size-3 ml-2 text-green-300" />
					) : (
						<Cross className="size-3 ml-2 text-red-300" />
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
				const [editModalOpen, setEditModalOpen] = React.useState(false);

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
							entity={character}
							gameId={gameId}
							onDelete={() => {
								deleteCharacter.mutate({
									path: { id: character.id, game_id: gameId },
								});
							}}
							onEdit={() => setEditModalOpen(true)}
						/>
						<EditCharacterDialog
							gameId={gameId}
							isOpen={editModalOpen}
							setIsOpen={setEditModalOpen}
							character={character}
						/>
					</div>
				);
			},
		},
	];
}

export function CharacterTable({ data, gameId }: CharacterTableProps) {
	const columns = createCharacterColumns(gameId);

	return (
		<EntityTable
			columns={columns}
			data={data}
			entityName="character"
			searchPlaceholder="Filter names..."
			tagPlaceholder="Filter tags..."
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
