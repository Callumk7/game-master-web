import type { ColumnDef } from "@tanstack/react-table";
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
} from "~/components/ui/entity-table";
import { EntityLinkButton } from "~/components/ui/entity-link-button";
import { useDeleteCharacterMutation } from "~/queries/characters";
import { Badge } from "../ui/badge";
import { EditCharacterDialog } from "./edit-character-dialog";

interface CharacterTableProps {
	data: Character[];
	searchQuery: string;
	onSearchChange: (query: string) => void;
	tagFilter: string;
	onTagFilterChange: (tag: string) => void;
	gameId: string;
	paginationSize?: number;
	onPaginationSizeChange?: (size: number) => void;
}

function createCharacterColumns(gameId: string): ColumnDef<Character>[] {
	return [
		{
			accessorKey: "name",
			header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
			minSize: 200,
			cell: ({ row }) => (
				<EntityLink
					entityType="character"
					gameId={gameId}
					entityId={row.original.id}
					name={row.getValue("name")}
					className="whitespace-pre-wrap"
				/>
			),
		},
		{
			accessorKey: "class",
			header: "Class",
			maxSize: 50,
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
			filterFn: "fuzzy",
			cell: ({ row }) => <TagsDisplay tags={row.getValue("tags")} />,
		},
		{
			accessorKey: "alive",
			header: "Alive",
			cell: ({ row }) => (
				<div className="text-center">{row.getValue("alive") ? "Yes" : "No"}</div>
			),
			maxSize: 50,
		},
		{
			accessorKey: "created_at",
			header: ({ column }) => (
				<SortableHeader column={column}>Created</SortableHeader>
			),
			cell: ({ row }) => <DateDisplay date={row.getValue("created_at")} />,
		},
		{
			id: "view",
			header: "View",
			maxSize: 60,
			enableHiding: false,
			cell: ({ row }) => {
				const character = row.original;
				return (
					<EntityLinkButton
						entity={{
							id: character.id,
							name: character.name,
							type: "character",
							content: character.content,
							content_plain_text: character.content_plain_text,
						}}
					/>
				);
			},
		},
		{
			id: "actions",
			maxSize: 60,
			enableHiding: false,
			cell: ({ row }) => {
				const character = row.original;
				const deleteCharacter = useDeleteCharacterMutation(gameId, character.id);
				const [editModalOpen, setEditModalOpen] = React.useState(false);

				return (
					<>
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
							isOpen={editModalOpen}
							setIsOpen={setEditModalOpen}
							character={character}
						/>
					</>
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
	paginationSize = 10,
	onPaginationSizeChange,
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
			paginationSize={paginationSize}
			onPaginationSizeChange={onPaginationSizeChange}
			enableColumnVisibility={true}
			enablePaginationSizeSelector={true}
			columnRelativeWidths={{
				name: 2,
				class: 0.6,
				actions: 0.5,
				content_plain_text: 2,
			}}
			defaultHidden={["content_plain_text"]}
		/>
	);
}
