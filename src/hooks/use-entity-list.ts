import { useMemo } from "react";
import {
	useListCharactersQuery,
	useListFactionsQuery,
	useListLocationsQuery,
	useListNotesQuery,
	useListQuestsQuery,
} from "~/api/@tanstack/react-query.gen";
import type { EntityType, Entity } from "~/types/split-view";
import type {
	Character as APICharacter,
	Faction as APIFaction,
	Location as APILocation,
	Note as APINote,
	Quest as APIQuest,
} from "~/api/types.gen";

interface UseEntityListParams {
	gameId: string;
	entityType?: EntityType;
	searchQuery?: string;
}

interface UseEntityListResult {
	data: Entity[];
	isLoading: boolean;
	isError: boolean;
	allEntities: Record<EntityType, Entity[]>;
	filteredEntities: Record<EntityType, Entity[]>;
}

function transformCharacters(characters: APICharacter[]): Entity[] {
	return characters.map((char) => ({
		id: char.id,
		name: char.name,
		content: char.content || "",
		content_plain_text: char.content_plain_text || "",
		tags: char.tags,
		pinned: char.pinned,
		class: char.class,
		level: char.level,
	}));
}

function transformFactions(factions: APIFaction[]): Entity[] {
	return factions.map((faction) => ({
		id: faction.id,
		name: faction.name,
		content: faction.content || "",
		content_plain_text: faction.content_plain_text || "",
		tags: faction.tags,
		pinned: faction.pinned,
	}));
}

function transformLocations(locations: APILocation[]): Entity[] {
	return locations.map((location) => ({
		id: location.id,
		name: location.name,
		content: location.content || "",
		content_plain_text: location.content_plain_text || "",
		tags: location.tags,
		pinned: location.pinned,
	}));
}

function transformNotes(notes: APINote[]): Entity[] {
	return notes.map((note) => ({
		id: note.id,
		name: note.name,
		content: note.content || "",
		content_plain_text: note.content_plain_text || "",
		tags: note.tags,
		pinned: note.pinned,
	}));
}

function transformQuests(quests: APIQuest[]): Entity[] {
	return quests.map((quest) => ({
		id: quest.id,
		name: quest.name,
		content: quest.content || "",
		content_plain_text: quest.content_plain_text || "",
		tags: quest.tags,
		pinned: quest.pinned,
		status: quest.status,
	}));
}

export function useEntityList({
	gameId,
	entityType,
	searchQuery = "",
}: UseEntityListParams): UseEntityListResult {
	// Fetch all entity types
	const { data: charactersData, isLoading: charactersLoading } = useListCharactersQuery(
		{
			path: { game_id: gameId },
		},
	);

	const { data: factionsData, isLoading: factionsLoading } = useListFactionsQuery({
		path: { game_id: gameId },
	});

	const { data: locationsData, isLoading: locationsLoading } = useListLocationsQuery({
		path: { game_id: gameId },
	});

	const { data: notesData, isLoading: notesLoading } = useListNotesQuery({
		path: { game_id: gameId },
	});

	const { data: questsData, isLoading: questsLoading } = useListQuestsQuery({
		path: { game_id: gameId },
	});

	const isLoading =
		charactersLoading ||
		factionsLoading ||
		locationsLoading ||
		notesLoading ||
		questsLoading;

	const allEntities: Record<EntityType, Entity[]> = useMemo(
		() => ({
			characters: transformCharacters(charactersData?.data || []),
			factions: transformFactions(factionsData?.data || []),
			locations: transformLocations(locationsData?.data || []),
			notes: transformNotes(notesData?.data || []),
			quests: transformQuests(questsData?.data || []),
		}),
		[charactersData, factionsData, locationsData, notesData, questsData],
	);

	const filteredEntities: Record<EntityType, Entity[]> = useMemo(() => {
		if (!searchQuery) return allEntities;

		const filterEntities = (entities: Entity[]) =>
			entities.filter((entity) => {
				const searchLower = searchQuery.toLowerCase();
				return (
					entity.name.toLowerCase().includes(searchLower) ||
					entity.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) ||
					(entity as any).class?.toLowerCase().includes(searchLower)
				);
			});

		return {
			characters: filterEntities(allEntities.characters),
			factions: filterEntities(allEntities.factions),
			locations: filterEntities(allEntities.locations),
			notes: filterEntities(allEntities.notes),
			quests: filterEntities(allEntities.quests),
		};
	}, [allEntities, searchQuery]);

	const data = entityType ? filteredEntities[entityType] : [];

	return {
		data,
		isLoading,
		isError: false, // TODO: Implement proper error handling
		allEntities,
		filteredEntities,
	};
}
