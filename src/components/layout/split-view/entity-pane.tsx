import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ExternalLink, RefreshCw } from "lucide-react";
import * as React from "react";
import {
	getCharacterOptions,
	getFactionOptions,
	getLocationOptions,
	getNoteOptions,
	getQuestOptions,
} from "~/api/@tanstack/react-query.gen";
import { EntityViewHeader } from "~/components/entity-view";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { EntityEditor } from "~/components/ui/editor/entity-editor";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Spinner } from "~/components/ui/spinner";
import { useUpdateCharacterMutation } from "~/queries/characters";
import { useUpdateFactionMutation } from "~/queries/factions";
import { useUpdateLocationMutation } from "~/queries/locations";
import { useUpdateNoteMutation } from "~/queries/notes";
import { useUpdateQuestMutation } from "~/queries/quests";

interface EntityPaneProps {
	gameId: string;
	entityPath: string; // Format: "type/id" e.g., "characters/123", "factions/456"
	onEntityChange?: (newPath: string) => void;
}

type EntityType = "characters" | "factions" | "locations" | "notes" | "quests";

export function EntityPane({ gameId, entityPath /*, onEntityChange*/ }: EntityPaneProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	// Parse entity path
	const [entityType, entityId] = entityPath.split("/") as [EntityType, string];

	// Navigate to full entity view
	const openFullView = React.useCallback(() => {
		const routeMap = {
			characters: "/games/$gameId/characters/$id" as const,
			factions: "/games/$gameId/factions/$id" as const,
			locations: "/games/$gameId/locations/$id" as const,
			notes: "/games/$gameId/notes/$id" as const,
			quests: "/games/$gameId/quests/$id" as const,
		};

		const route = routeMap[entityType];
		if (route) {
			navigate({
				to: route,
				params: { gameId, id: entityId },
			});
		}
	}, [navigate, gameId, entityType, entityId]);

	// Refresh entity data
	const refreshEntity = React.useCallback(() => {
		// Invalidate queries for this specific entity
		queryClient.invalidateQueries({
			predicate: (query) => {
				const queryKey = query.queryKey;
				return (
					Array.isArray(queryKey) &&
					queryKey.some(
						(key) =>
							typeof key === "object" &&
							key !== null &&
							"path" in key &&
							typeof key.path === "object" &&
							key.path !== null &&
							"game_id" in key.path &&
							key.path.game_id === gameId &&
							Object.values(key.path).includes(entityId),
					)
				);
			},
		});
	}, [queryClient, gameId, entityId]);

	return (
		<div className="h-full flex flex-col">
			{/* Pane Header */}
			<div className="flex-shrink-0 flex items-center justify-between p-2 border-b bg-card">
				<div className="flex items-center gap-2">
					<Badge variant="outline" className="text-xs">
						{entityType.slice(0, -1)} {/* Remove 's' suffix */}
					</Badge>
					<span className="text-sm font-medium truncate">{entityId}</span>
				</div>
				<div className="flex gap-1">
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={refreshEntity}
						title="Refresh"
					>
						<RefreshCw className="h-3 w-3" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={openFullView}
						title="Open in full view"
					>
						<ExternalLink className="h-3 w-3" />
					</Button>
				</div>
			</div>

			{/* Entity Content */}
			<div className="flex-1 min-h-0">
				<ScrollArea className="h-[75vh]">
					<EntityPaneContent
						key={`${entityType}-${entityId}`}
						gameId={gameId}
						entityType={entityType}
						entityId={entityId}
					/>
				</ScrollArea>
			</div>
		</div>
	);
}

function EntityPaneLoading() {
	return (
		<div className="flex items-center justify-center h-32">
			<Spinner className="h-6 w-6" />
		</div>
	);
}

interface EntityPaneContentProps {
	gameId: string;
	entityType: EntityType;
	entityId: string;
}

function EntityPaneContent({ gameId, entityType, entityId }: EntityPaneContentProps) {
	switch (entityType) {
		case "characters":
			return <CharacterPaneContent gameId={gameId} characterId={entityId} />;
		case "factions":
			return <FactionPaneContent gameId={gameId} factionId={entityId} />;
		case "locations":
			return <LocationPaneContent gameId={gameId} locationId={entityId} />;
		case "notes":
			return <NotePaneContent gameId={gameId} noteId={entityId} />;
		case "quests":
			return <QuestPaneContent gameId={gameId} questId={entityId} />;
		default:
			return (
				<div className="p-4 text-center text-muted-foreground">
					<p>Entity type "{entityType}" not yet supported in split view</p>
				</div>
			);
	}
}

function CharacterPaneContent({
	gameId,
	characterId,
}: {
	gameId: string;
	characterId: string;
}) {
	const { data, isLoading, isError } = useQuery(
		getCharacterOptions({ path: { game_id: gameId, id: characterId } }),
	);

	const updateCharacter = useUpdateCharacterMutation(gameId, characterId);

	if (isLoading) {
		return <EntityPaneLoading />;
	}

	if (isError || !data?.data) {
		return (
			<div className="p-4 text-center text-muted-foreground">
				Character not found
			</div>
		);
	}

	const character = data.data;

	const handleSave = async (payload: {
		content: string;
		content_plain_text: string;
	}) => {
		updateCharacter.mutateAsync({
			body: { character: payload },
			path: { game_id: gameId, id: characterId },
		});
	};

	const badges = (
		<div className="flex flex-wrap gap-2">
			<Badge>{character.class}</Badge>
			<Badge>Level: {character.level}</Badge>
			{character.tags &&
				character.tags.length > 0 &&
				character.tags.map((tag) => (
					<Badge key={tag} variant="secondary">
						{tag}
					</Badge>
				))}
		</div>
	);

	return (
		<div className="p-4 space-y-4">
			<EntityViewHeader
				id={character.id}
				gameId={gameId}
				type="character"
				content={character.content}
				content_plain_text={character.content_plain_text}
				name={character.name}
				badges={badges}
				pinned={character.pinned}
			/>
			<EntityEditor
				content={character.content}
				gameId={gameId}
				entityType="character"
				entityId={character.id}
				onSave={handleSave}
				isSaving={updateCharacter.isPending}
				className="min-h-[200px]"
			/>
		</div>
	);
}

function FactionPaneContent({
	gameId,
	factionId,
}: {
	gameId: string;
	factionId: string;
}) {
	const { data, isLoading, isError } = useQuery(
		getFactionOptions({ path: { game_id: gameId, id: factionId } }),
	);

	const updateFaction = useUpdateFactionMutation(gameId, factionId);

	if (isLoading) {
		return <EntityPaneLoading />;
	}

	if (isError || !data?.data) {
		return (
			<div className="p-4 text-center text-muted-foreground">Faction not found</div>
		);
	}

	const faction = data.data;

	const handleSave = async (payload: {
		content: string;
		content_plain_text: string;
	}) => {
		updateFaction.mutate({
			body: { faction: payload },
			path: { game_id: gameId, id: factionId },
		});
	};

	const badges = faction.tags && faction.tags.length > 0 && (
		<div className="flex flex-wrap gap-2">
			{faction.tags.map((tag) => (
				<Badge key={tag} variant="secondary">
					{tag}
				</Badge>
			))}
		</div>
	);

	return (
		<div className="p-4 space-y-4">
			<EntityViewHeader
				id={faction.id}
				gameId={gameId}
				type="faction"
				content={faction.content}
				content_plain_text={faction.content_plain_text}
				name={faction.name}
				badges={badges}
			/>
			<EntityEditor
				content={faction.content}
				gameId={gameId}
				entityType="faction"
				entityId={faction.id}
				onSave={handleSave}
				isSaving={updateFaction.isPending}
				className="min-h-[200px]"
			/>
		</div>
	);
}

function LocationPaneContent({
	gameId,
	locationId,
}: {
	gameId: string;
	locationId: string;
}) {
	const { data, isLoading, isError } = useQuery(
		getLocationOptions({ path: { game_id: gameId, id: locationId } }),
	);

	const updateLocation = useUpdateLocationMutation(gameId, locationId);

	if (isLoading) {
		return <EntityPaneLoading />;
	}

	if (isError || !data?.data) {
		return (
			<div className="p-4 text-center text-muted-foreground">
				Location not found
			</div>
		);
	}

	const location = data.data;

	const handleSave = async (payload: {
		content: string;
		content_plain_text: string;
	}) => {
		updateLocation.mutate({
			body: { location: payload },
			path: { game_id: gameId, id: locationId },
		});
	};

	const badges = location.tags && location.tags.length > 0 && (
		<div className="flex flex-wrap gap-2">
			{location.tags.map((tag) => (
				<Badge key={tag} variant="secondary">
					{tag}
				</Badge>
			))}
		</div>
	);

	return (
		<div className="p-4 space-y-4">
			<EntityViewHeader
				id={location.id}
				gameId={gameId}
				type="location"
				content={location.content}
				content_plain_text={location.content_plain_text}
				name={location.name}
				badges={badges}
			/>
			<EntityEditor
				content={location.content}
				gameId={gameId}
				entityType="location"
				entityId={location.id}
				onSave={handleSave}
				isSaving={updateLocation.isPending}
				className="min-h-[200px]"
			/>
		</div>
	);
}

function NotePaneContent({ gameId, noteId }: { gameId: string; noteId: string }) {
	const { data, isLoading, isError } = useQuery(
		getNoteOptions({ path: { game_id: gameId, id: noteId } }),
	);

	const updateNote = useUpdateNoteMutation(gameId, noteId);

	if (isLoading) {
		return <EntityPaneLoading />;
	}

	if (isError || !data?.data) {
		return (
			<div className="p-4 text-center text-muted-foreground">Note not found</div>
		);
	}

	const note = data.data;

	const handleSave = async (payload: {
		content: string;
		content_plain_text: string;
	}) => {
		updateNote.mutate({
			body: { note: payload },
			path: { game_id: gameId, id: noteId },
		});
	};

	const badges = note.tags && note.tags.length > 0 && (
		<div className="flex flex-wrap gap-2">
			{note.tags.map((tag) => (
				<Badge key={tag} variant="secondary">
					{tag}
				</Badge>
			))}
		</div>
	);

	return (
		<div className="p-4 space-y-4">
			<EntityViewHeader
				id={note.id}
				gameId={gameId}
				type="note"
				content={note.content}
				content_plain_text={note.content_plain_text}
				name={note.name}
				badges={badges}
			/>
			<EntityEditor
				content={note.content}
				gameId={gameId}
				entityType="note"
				entityId={note.id}
				onSave={handleSave}
				isSaving={updateNote.isPending}
				className="min-h-[200px]"
			/>
		</div>
	);
}

function QuestPaneContent({ gameId, questId }: { gameId: string; questId: string }) {
	const { data, isLoading, isError } = useQuery(
		getQuestOptions({ path: { game_id: gameId, id: questId } }),
	);

	const updateQuest = useUpdateQuestMutation(gameId, questId);

	if (isLoading) {
		return <EntityPaneLoading />;
	}

	if (isError || !data?.data) {
		return (
			<div className="p-4 text-center text-muted-foreground">Quest not found</div>
		);
	}

	const quest = data.data;

	const handleSave = async (payload: {
		content: string;
		content_plain_text: string;
	}) => {
		updateQuest.mutate({
			body: { quest: payload },
			path: { game_id: gameId, id: questId },
		});
	};

	const badges = (
		<div className="flex flex-wrap gap-2">
			<Badge>{quest.status}</Badge>
			{quest.tags &&
				quest.tags.length > 0 &&
				quest.tags.map((tag) => (
					<Badge key={tag} variant="secondary">
						{tag}
					</Badge>
				))}
		</div>
	);

	return (
		<div className="p-4 space-y-4">
			<EntityViewHeader
				id={quest.id}
				gameId={gameId}
				type="quest"
				content={quest.content}
				content_plain_text={quest.content_plain_text}
				name={quest.name}
				badges={badges}
			/>
			<EntityEditor
				content={quest.content}
				gameId={gameId}
				entityType="quest"
				entityId={quest.id}
				onSave={handleSave}
				isSaving={updateQuest.isPending}
				className="min-h-[200px]"
			/>
		</div>
	);
}
