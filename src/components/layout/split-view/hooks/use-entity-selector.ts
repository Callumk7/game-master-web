import * as React from "react";
import { useGetGameLinksSuspenseQuery } from "~/queries/games";
import type { Entity, EntityCollection } from "~/types";
import type { EntitySelectorState } from "~/types/split-view";
import { transformEntitiesForSelector } from "~/utils/entity-transformers";

interface UseEntitySelectorParams {
	gameId: string;
	isOpen: boolean;
}

export function useEntitySelector({
	gameId,
	isOpen,
}: UseEntitySelectorParams): EntitySelectorState {
	const [searchQuery, setSearchQuery] = React.useState("");

	// Use the consolidated approach to fetch all entities in one request
	const { data: linksData } = useGetGameLinksSuspenseQuery({ id: gameId });

	const { filteredEntities } = React.useMemo(() => {
		// Transform the consolidated data into the format expected by the entity selector
		const all = transformEntitiesForSelector(linksData?.data?.entities);

		if (!searchQuery) {
			return { filteredEntities: all };
		}

		// Apply search filtering logic (same as the original useEntityList)
		const filterEntities = (entities: Entity[]) =>
			entities.filter((entity) => {
				const searchLower = searchQuery.toLowerCase();
				return (
					entity.name?.toLowerCase().includes(searchLower) ||
					entity.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) ||
					("class" in entity &&
						entity.class?.toLowerCase().includes(searchLower))
				);
			});

		const filtered: EntityCollection = {
			characters: filterEntities(all.characters),
			factions: filterEntities(all.factions),
			locations: filterEntities(all.locations),
			notes: filterEntities(all.notes),
			quests: filterEntities(all.quests),
		};

		return { filteredEntities: filtered };
	}, [linksData, searchQuery]);

	// Reset search when selector closes
	React.useEffect(() => {
		if (!isOpen) {
			setSearchQuery("");
		}
	}, [isOpen]);

	return {
		searchQuery,
		setSearchQuery,
		filteredEntities,
	};
}
