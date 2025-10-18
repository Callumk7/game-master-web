import type { Entities } from "~/api/types.gen";
import type { EntityCollection } from "~/types";

/**
 * Transform the consolidated API response entities into the format expected by the entity selector
 */
export function transformEntitiesForSelector(entities?: Entities): EntityCollection {
	if (!entities) {
		return {
			characters: [],
			factions: [],
			locations: [],
			notes: [],
			quests: [],
		};
	}

	return {
		characters: entities.characters || [],
		factions: entities.factions || [],
		locations: entities.locations || [],
		notes: entities.notes || [],
		quests: entities.quests || [],
	};
}
