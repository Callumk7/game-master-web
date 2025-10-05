import { useMemo } from "react";
import {
	useListCharactersQuery,
	useListFactionsQuery,
	useListLocationsQuery,
	useListNotesQuery,
	useListQuestsQuery,
} from "~/api/@tanstack/react-query.gen";
import type { EntityType, Entity } from "~/types/split-view";

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

export function useEntityList({
	gameId,
	entityType,
	searchQuery = "",
}: UseEntityListParams): UseEntityListResult {
	// Fetch all entity types
	const { data: charactersData, isLoading: charactersLoading } = useListCharactersQuery({
		path: { game_id: gameId },
	});

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

	const isLoading = charactersLoading || factionsLoading || locationsLoading || notesLoading || questsLoading;

	const allEntities: Record<EntityType, Entity[]> = useMemo(() => ({
		characters: charactersData?.data || [],
		factions: factionsData?.data || [],
		locations: locationsData?.data || [],
		notes: notesData?.data || [],
		quests: questsData?.data || [],
	}), [charactersData, factionsData, locationsData, notesData, questsData]);

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
