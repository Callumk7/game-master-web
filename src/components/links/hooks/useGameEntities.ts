import { useMemo } from "react";
import { useGetGameLinksSuspenseQuery } from "~/queries/games";
import type { EntityType } from "~/types";
import type { EntityOption } from "../types";

interface BaseEntity {
	id: string;
	name: string;
}

export function useGameEntities(gameId: string) {
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

		const transformers = {
			characters: (items: BaseEntity[]) =>
				items?.map((item) => ({
					label: item.name,
					value: `character:${item.id}`,
					type: "character" as EntityType,
				})) ?? [],
			factions: (items: BaseEntity[]) =>
				items?.map((item) => ({
					label: item.name,
					value: `faction:${item.id}`,
					type: "faction" as EntityType,
				})) ?? [],
			locations: (items: BaseEntity[]) =>
				items?.map((item) => ({
					label: item.name,
					value: `location:${item.id}`,
					type: "location" as EntityType,
				})) ?? [],
			notes: (items: BaseEntity[]) =>
				items?.map((item) => ({
					label: item.name,
					value: `note:${item.id}`,
					type: "note" as EntityType,
				})) ?? [],
			quests: (items: BaseEntity[]) =>
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
			const items = rawEntities[type as keyof typeof rawEntities];
			if (items) {
				entityGroups[entityType] = transformer(items);
			}
		});

		return entityGroups;
	}, [data]);

	return {
		entities,
		isLoading,
		error,
		flatEntities: useMemo(() => Object.values(entities).flat(), [entities]),
	};
}
