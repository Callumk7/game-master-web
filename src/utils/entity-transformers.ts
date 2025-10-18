import type {
	Character,
	Entities,
	Faction,
	Location,
	Note,
	Quest,
} from "~/api/types.gen";
import type { Entity, EntityCollection } from "~/types";

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
		characters: transformCharacters(entities.characters || []),
		factions: transformFactions(entities.factions || []),
		locations: transformLocations(entities.locations || []),
		notes: transformNotes(entities.notes || []),
		quests: transformQuests(entities.quests || []),
	};
}

function transformCharacters(characters: Character[]): Entity[] {
	return characters.map((char) => char);
}

function transformFactions(factions: Faction[]): Entity[] {
	return factions.map((faction) => faction);
}

function transformLocations(locations: Location[]): Entity[] {
	return locations.map((location) => location);
}

function transformNotes(notes: Note[]): Entity[] {
	return notes.map((note) => note);
}

function transformQuests(quests: Quest[]): Entity[] {
	return quests.map((quest) => quest);
}
