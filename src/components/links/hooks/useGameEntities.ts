import { useMemo } from "react";
import { useGetGameLinksSuspenseQuery } from "~/queries/games";
import type { EntityType } from "~/types";
import type { EntityOption } from "../types";

export function useGameEntities(
	gameId: string,
	excludeTypes?: EntityType[],
	excludeIds?: string[],
) {
	const { data, isLoading, error } = useGetGameLinksSuspenseQuery({ id: gameId });

	const entities = useMemo(() => {
		if (!data?.data?.entities) {
			return {
				character: [],
				faction: [],
				location: [],
				note: [],
				quest: [],
			} as Record<EntityType, EntityOption[]>;
		}

		const entityGroups: Record<EntityType, EntityOption[]> = {
			character: [],
			faction: [],
			location: [],
			note: [],
			quest: [],
		};

		const rawEntities = data.data.entities;

		const transformers: Record<string, (items: any[]) => EntityOption[]> = {
			characters: (items) =>
				items?.map((item) => ({
					label: item.name,
					value: `character:${item.id}`,
					type: "character" as EntityType,
				})) ?? [],
			factions: (items) =>
				items?.map((item) => ({
					label: item.name,
					value: `faction:${item.id}`,
					type: "faction" as EntityType,
				})) ?? [],
			locations: (items) =>
				items?.map((item) => ({
					label: item.name,
					value: `location:${item.id}`,
					type: "location" as EntityType,
				})) ?? [],
			notes: (items) =>
				items?.map((item) => ({
					label: item.name,
					value: `note:${item.id}`,
					type: "note" as EntityType,
				})) ?? [],
			quests: (items) =>
				items?.map((item) => ({
					label: item.name,
					value: `quest:${item.id}`,
					type: "quest" as EntityType,
				})) ?? [],
		};

		const typeMapping: Record<string, EntityType> = {
			characters: "character",
			factions: "faction",
			locations: "location",
			notes: "note",
			quests: "quest",
		};

		Object.entries(transformers).forEach(([type, transformer]) => {
			const entityType = typeMapping[type];

			if (excludeTypes?.includes(entityType)) return;

			const items = rawEntities[type as keyof typeof rawEntities];
			if (items) {
				entityGroups[entityType] = transformer(items).filter(
					(item) => !excludeIds?.includes(item.value),
				);
			}
		});

		const result: Record<EntityType, EntityOption[]> = {
			character: entityGroups.character,
			faction: entityGroups.faction,
			location: entityGroups.location,
			note: entityGroups.note,
			quest: entityGroups.quest,
		};

		return result;
	}, [data, excludeTypes, excludeIds]);

	return {
		entities,
		isLoading,
		error,
		flatEntities: useMemo(() => Object.values(entities).flat(), [entities]),
	};
}
