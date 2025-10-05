import { useQuery } from "@tanstack/react-query";
import {
	getCharacterOptions,
	getFactionOptions,
	getLocationOptions,
	getNoteOptions,
	getQuestOptions,
} from "~/api/@tanstack/react-query.gen";
import type { EntityType, Entity } from "~/types/split-view";

interface UseEntityDataParams {
	gameId: string;
	entityType: EntityType;
	entityId: string;
}

interface UseEntityDataResult {
	data: Entity | undefined;
	isLoading: boolean;
	isError: boolean;
	error: Error | null;
}

export function useEntityData({
	gameId,
	entityType,
	entityId,
}: UseEntityDataParams): UseEntityDataResult {
	const queryOptions = getQueryOptions(entityType, gameId, entityId);
	
	const { data, isLoading, isError, error } = useQuery(queryOptions);

	return {
		data: data?.data,
		isLoading,
		isError,
		error: error as Error | null,
	};
}

function getQueryOptions(entityType: EntityType, gameId: string, entityId: string) {
	const commonParams = { path: { game_id: gameId, id: entityId } };

	switch (entityType) {
		case "characters":
			return getCharacterOptions(commonParams);
		case "factions":
			return getFactionOptions(commonParams);
		case "locations":
			return getLocationOptions(commonParams);
		case "notes":
			return getNoteOptions(commonParams);
		case "quests":
			return getQuestOptions(commonParams);
		default:
			throw new Error(`Unsupported entity type: ${entityType}`);
	}
}
