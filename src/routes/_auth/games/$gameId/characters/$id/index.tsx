import { createFileRoute, Navigate } from "@tanstack/react-router";
import type { Character, CharacterLinksResponse } from "~/api";
import {
	listPinnedEntitiesQueryKey,
	useGetCharacterLinksQuery,
} from "~/api/@tanstack/react-query.gen";
import { CharacterFactionView } from "~/components/characters/character-faction-view";
import { CharacterImages } from "~/components/characters/character-images";
import { CharacterNotesView } from "~/components/characters/character-note-view";
import { CreateCharacterLink } from "~/components/characters/create-character-link";
import { useAddTab } from "~/components/entity-tabs";
import { EntityView } from "~/components/entity-view";
import { Badge } from "~/components/ui/badge";
import { EntityEditor } from "~/components/ui/editor/entity-editor";
import { EntityLinksTable } from "~/components/ui/entity-links-table";
import { NodeViewer } from "~/lib/node-viewer";
import type { Connection, NodePosition, NodeTypeConfig } from "~/lib/node-viewer/types";
import {
	useGetCharacterSuspenseQuery,
	useUpdateCharacterMutation,
} from "~/queries/characters";
import { flattenLinksForTable, type GenericLinksResponse } from "~/utils/linkHelpers";

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

	// Node extractor for character links visualization
	const nodeExtractor = (response: CharacterLinksResponse) => {
		const nodes = new Map<string, NodePosition>();
		const connections: Connection[] = [];

		if (!response.data?.links) {
			return { nodes, connections };
		}

		const { links } = response.data;

		// Add the main character as the central node
		nodes.set(character.id, {
			x: 0,
			y: 0,
			vx: 0,
			vy: 0,
			id: character.id,
			name: character.name,
			type: "character",
			children: [],
			connectionCount: 0,
		});

		// Add linked entities as nodes
		if (links.characters) {
			for (const char of links.characters) {
				nodes.set(char.id, {
					x: 0,
					y: 0,
					vx: 0,
					vy: 0,
					id: char.id,
					name: char.name,
					type: "character",
					children: [],
					connectionCount: 0,
				});
				connections.push({
					from: character.id,
					to: char.id,
				});
			}
		}

		if (links.factions) {
			for (const faction of links.factions) {
				nodes.set(faction.id, {
					x: 0,
					y: 0,
					vx: 0,
					vy: 0,
					id: faction.id,
					name: faction.name,
					type: "faction",
					children: [],
					connectionCount: 0,
				});
				connections.push({
					from: character.id,
					to: faction.id,
				});
			}
		}

		if (links.locations) {
			for (const location of links.locations) {
				nodes.set(location.id, {
					x: 0,
					y: 0,
					vx: 0,
					vy: 0,
					id: location.id,
					name: location.name,
					type: "location",
					children: [],
					connectionCount: 0,
				});
				connections.push({
					from: character.id,
					to: location.id,
				});
			}
		}

		if (links.quests) {
			for (const quest of links.quests) {
				nodes.set(quest.id, {
					x: 0,
					y: 0,
					vx: 0,
					vy: 0,
					id: quest.id,
					name: quest.name,
					type: "quest",
					children: [],
					connectionCount: 0,
				});
				connections.push({
					from: character.id,
					to: quest.id,
				});
			}
		}

		if (links.notes) {
			for (const note of links.notes) {
				nodes.set(note.id, {
					x: 0,
					y: 0,
					vx: 0,
					vy: 0,
					id: note.id,
					name: note.name,
					type: "note",
					children: [],
					connectionCount: 0,
				});
				connections.push({
					from: character.id,
					to: note.id,
				});
			}
		}

		return { nodes, connections };
	};

	// Node type configuration for styling
	const nodeTypeConfig: NodeTypeConfig = {
		character: {
			color: "#3b82f6",
			label: "Character",
		},
		faction: {
			color: "#8b5cf6",
			label: "Faction",
		},
		location: {
			color: "#10b981",
			label: "Location",
		},
		quest: {
			color: "#f59e0b",
			label: "Quest",
		},
		note: {
			color: "#ef4444",
			label: "Note",
		},
	};

	const handleSave = async (payload: {
		content: string;
		content_plain_text: string;
	}) => {
		updateCharacter.mutateAsync({
			body: { character: payload },
			path: { game_id: gameId, id: character.id },
		});
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
			isSaving={updateCharacter.isPending}
		/>
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
					<NodeViewer
						data={linksResponse}
						nodeExtractor={nodeExtractor}
						nodeTypeConfig={nodeTypeConfig}
						height={400}
						onNodeClick={(nodeId) => {
							// Handle node click - could navigate to the entity
							console.log("Clicked node:", nodeId);
						}}
					/>
					<EntityLinksTable
						links={flattenLinksForTable(
							linksResponse as GenericLinksResponse,
						)}
						gameId={gameId}
						sourceType="character"
						sourceId={character.id}
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
			content: (
				<CharacterFactionView
					gameId={gameId}
					characterId={character.id}
					primaryFactionId={character.member_of_faction_id}
				/>
			),
		},
		{
			id: "images",
			label: "Images",
			content: <CharacterImages gameId={gameId} characterId={character.id} />,
		},
	];

	const navigate = Route.useNavigate();

	return (
		<EntityView
			id={character.id}
			type="character"
			content={character.content}
			content_plain_text={character.content_plain_text}
			name={character.name}
			badges={badges}
			tabs={tabs}
			pinned={character.pinned}
			onEdit={() => navigate({ to: "edit" })}
			onTogglePin={handleTogglePin}
		/>
	);
}
