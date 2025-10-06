import { useQuery } from "@tanstack/react-query";
import {
	getCharacterOptions,
	getFactionOptions,
	getLocationOptions,
	getNoteOptions,
	getQuestOptions,
} from "~/api/@tanstack/react-query.gen";
import type {
	Character as APICharacter,
	Faction as APIFaction,
	Location as APILocation,
	Note as APINote,
	Quest as APIQuest,
} from "~/api/types.gen";
import type { Entity, EntityType } from "~/types/split-view";

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

	const { data, isLoading, isError, error } = useQuery(queryOptions as any);

	const apiData = (data as any)?.data;

	return {
		data: apiData
			? transformApiEntityToSplitViewEntity(apiData, entityType)
			: undefined,
		isLoading,
		isError,
		error: error as Error | null,
	};
}

function transformApiEntityToSplitViewEntity(
	entity: APICharacter | APIFaction | APILocation | APINote | APIQuest,
	entityType: EntityType,
): Entity {
	const baseEntity = {
		id: entity.id,
		name: entity.name,
		content: entity.content || "",
		content_plain_text: entity.content_plain_text || "",
		tags: entity.tags,
		pinned: entity.pinned,
	};

	switch (entityType) {
		case "characters": {
			const char = entity as APICharacter;
			return {
				...baseEntity,
				class: char.class,
				level: char.level,
			};
		}
		case "quests": {
			const quest = entity as APIQuest;
			return {
				...baseEntity,
				status: quest.status,
			};
		}
		case "factions":
		case "locations":
		case "notes":
		default:
			return baseEntity;
	}
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
