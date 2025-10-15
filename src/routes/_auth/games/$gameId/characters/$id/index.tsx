import { ClientOnly, createFileRoute, Navigate } from "@tanstack/react-router";
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
import { EditCharacterDialog } from "~/components/characters/edit-character-dialog";
import { useAddTab } from "~/components/entity-tabs";
import { EntityView } from "~/components/entity-view";
import { EntityLinksTable } from "~/components/links/entity-links-table";
import { createBaseLinkTableColumns } from "~/components/links/link-table-columns";
import type { GenericLinksResponse } from "~/components/links/types";
import { flattenLinksForTable } from "~/components/links/utils";
import { Badge } from "~/components/ui/badge";
import { EntityEditor } from "~/components/ui/editor/entity-editor";
import {
	useDeleteCharacterMutation,
	useGetCharacterSuspenseQuery,
	useUpdateCharacterMutation,
} from "~/queries/characters";

export const Route = createFileRoute("/_auth/games/$gameId/characters/$id/")({
	component: RouteComponent,
});

function RouteComponent() {
	const params = Route.useParams();
	const { gameId, id } = params;
	const { data } = useGetCharacterSuspenseQuery(gameId, id);
	const character = data?.data;

	useAddTab({
		data: character,
		entityType: "characters",
		gameId,
	});

	if (!character) {
		return <Navigate to=".." />;
	}

	return <CharacterView character={character} gameId={gameId} />;
}

// MAIN VIEW COMPONENT

interface CharacterViewProps {
	character: Character;
	gameId: string;
}
function CharacterView({ character, gameId }: CharacterViewProps) {
	const {
		data: linksResponse,
		isLoading: linksLoading,
		isError: linksError,
		error: linksQueryError,
	} = useGetCharacterLinksQuery({
		path: { game_id: gameId, character_id: character.id },
	});

	const context = Route.useRouteContext();
	const updateCharacter = useUpdateCharacterMutation(gameId, character.id);

	const handleSave = async (payload: {
		content: string;
		content_plain_text: string;
	}) => {
		updateCharacter.mutateAsync({
			body: { character: payload },
			path: { game_id: gameId, id: character.id },
		});
	};

	const deleteCharacter = useDeleteCharacterMutation(gameId, character.id);

	const handleDelete = () => {
		deleteCharacter.mutate({
			path: { game_id: gameId, id: character.id },
		});
		toast("Character deleted successfully!");
		navigate({ to: "." });
	};

	// We also have pinCharacterMutation, but since the character mutation is already
	// being used, we can just use it for both actions.
	const handleTogglePin = async () => {
		updateCharacter.mutateAsync(
			{
				body: { character: { pinned: !character.pinned } },
				path: { game_id: gameId, id: character.id },
			},
			{
				onSuccess: () => {
					context.queryClient.invalidateQueries({
						queryKey: listPinnedEntitiesQueryKey({
							path: { game_id: gameId },
						}),
					});
				},
			},
		);
	};

	const badges = (
		<div className="flex flex-wrap gap-2">
			<Badge>{character.class}</Badge>
			<Badge>Level: {character.level}</Badge>
			{character.tags && character.tags.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{character.tags.map((tag) => (
						<Badge key={tag} variant="secondary">
							{tag}
						</Badge>
					))}
				</div>
			)}
		</div>
	);

	const contentTab = (
		<EntityEditor
			content={character.content}
			gameId={gameId}
			entityType="character"
			entityId={character.id}
			onSave={handleSave}
		/>
	);

	const columns = React.useMemo(
		() => createBaseLinkTableColumns(gameId, character.id, "character"),
		[gameId, character.id],
	);

	const linksTab = (
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

	const tabs = [
		{
			id: "content",
			label: "Content",
			content: contentTab,
		},
		{
			id: "links",
			label: "Links",
			content: linksTab,
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

	const navigate = Route.useNavigate();
	const [editModalOpen, setEditModalOpen] = React.useState(false);

	return (
		<>
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
				onEdit={() => setEditModalOpen(true)}
				onDelete={handleDelete}
				onTogglePin={handleTogglePin}
			/>
			<EditCharacterDialog
				gameId={gameId}
				isOpen={editModalOpen}
				setIsOpen={setEditModalOpen}
				character={character}
			/>
		</>
	);
}
