import { useQueryClient } from "@tanstack/react-query";
import { ClientOnly, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";
import type { Character } from "~/api";
import {
	listPinnedEntitiesQueryKey,
	useGetCharacterLinksQuery,
} from "~/api/@tanstack/react-query.gen";
import { CharacterFactionView } from "~/components/characters/character-faction-view";
import { CharacterImages } from "~/components/characters/character-images";
import { CharacterNodeViewer } from "~/components/characters/character-node-viewer";
import { CharacterNotesView } from "~/components/characters/character-note-view";
import { CreateCharacterLink } from "~/components/characters/create-character-link";
import { EntityLinksTable } from "~/components/links/entity-links-table";
import { createBaseLinkTableColumns } from "~/components/links/link-table-columns";
import type { GenericLinksResponse } from "~/components/links/types";
import { flattenLinksForTable } from "~/components/links/utils";
import { EntityEditor } from "~/components/ui/editor/entity-editor";
import { EntityView } from "~/components/views/entity-view";
import {
	useDeleteCharacterMutation,
	useUpdateCharacterMutation,
} from "~/queries/characters";
import { useHandleEditCharacter } from "~/state/ui";
import { createBadges } from "../utils";

interface CharacterViewProps {
	character: Character;
	gameId: string;
}

export function CharacterView({ character, gameId }: CharacterViewProps) {
	const queryClient = useQueryClient();
	const navigate = useNavigate({ from: "/games/$gameId/characters/$id" });

	const updateCharacter = useUpdateCharacterMutation(gameId, character.id);
	const handleTogglePin = async () => {
		updateCharacter.mutateAsync(
			{
				body: { character: { pinned: !character.pinned } },
				path: { game_id: gameId, id: character.id },
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: listPinnedEntitiesQueryKey({
							path: { game_id: gameId },
						}),
					});
				},
			},
		);
	};

	const deleteCharacter = useDeleteCharacterMutation(gameId, character.id);
	const handleDelete = () => {
		deleteCharacter.mutate({
			path: { game_id: gameId, id: character.id },
		});
		toast.success("Character deleted successfully!");
		navigate({ to: "." });
	};

	const badges = createBadges(
		[character.class, `Level: ${character.level}`],
		character.tags,
	);

	const tabs = [
		{
			id: "content",
			label: "Content",
			content: <ContentTab character={character} gameId={gameId} />,
		},
		{
			id: "links",
			label: "Links",
			content: <LinksTab character={character} gameId={gameId} />,
		},
		{
			id: "notes",
			label: "Notes",
			content: <CharacterNotesView gameId={gameId} characterId={character.id} />,
		},
		{
			id: "faction",
			label: "Faction",
			content: <CharacterFactionView gameId={gameId} characterId={character.id} />,
		},
		{
			id: "images",
			label: "Images",
			content: <CharacterImages gameId={gameId} characterId={character.id} />,
		},
	];

	const handleEdit = useHandleEditCharacter(character.id);

	return (
		<EntityView
			id={character.id}
			gameId={gameId}
			type="character"
			content={character.content}
			content_plain_text={character.content_plain_text}
			name={character.name}
			badges={badges}
			tabs={tabs}
			pinned={character.pinned}
			onEdit={handleEdit}
			onDelete={handleDelete}
			onTogglePin={handleTogglePin}
		/>
	);
}

// =============================================================================
// CONTENT TAB COMPONENT
// =============================================================================
interface ContentTabProps {
	character: Character;
	gameId: string;
}
function ContentTab({ character, gameId }: ContentTabProps) {
	const updateCharacter = useUpdateCharacterMutation(gameId, character.id);
	const handleSave = async (payload: {
		content: string;
		content_plain_text: string;
	}) => {
		updateCharacter.mutate({
			body: { character: payload },
			path: { game_id: gameId, id: character.id },
		});
	};
	return (
		<EntityEditor
			content={character.content}
			gameId={gameId}
			entityType="character"
			entityId={character.id}
			onSave={handleSave}
		/>
	);
}

// =============================================================================
// LINKS TAB COMPONENT
// =============================================================================
interface LinksTabProps {
	character: Character;
	gameId: string;
}
function LinksTab({ character, gameId }: LinksTabProps) {
	const {
		data: linksResponse,
		isLoading: linksLoading,
		isError: linksError,
		error: linksQueryError,
	} = useGetCharacterLinksQuery({
		path: { game_id: gameId, character_id: character.id },
	});

	const columns = React.useMemo(
		() => createBaseLinkTableColumns(gameId, character.id, "character"),
		[gameId, character.id],
	);

	return (
		<div className="space-y-4">
			<CreateCharacterLink gameId={gameId} characterId={character.id} />
			{linksLoading && (
				<div className="text-muted-foreground">Loading links...</div>
			)}
			{linksError && (
				<div className="text-destructive">
					Error loading links: {linksQueryError?.message}
				</div>
			)}
			{!linksLoading && !linksError && linksResponse && (
				<>
					<ClientOnly>
						<CharacterNodeViewer
							characterId={character.id}
							characterName={character.name}
							linksResponse={linksResponse}
							onNodeClick={(nodeId) => {
								// Handle node click - could navigate to the entity
								console.log("Clicked node:", nodeId);
							}}
						/>
					</ClientOnly>
					<EntityLinksTable
						links={flattenLinksForTable(
							linksResponse as GenericLinksResponse,
						)}
						columns={columns}
					/>
				</>
			)}
		</div>
	);
}
