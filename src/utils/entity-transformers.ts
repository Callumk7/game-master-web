import type {
	Character,
	Entities,
	Faction,
	Location,
	Note,
	Quest,
} from "~/api/types.gen";
import type { Entity, EntityType } from "~/types/split-view";

/**
 * Transform the consolidated API response entities into the format expected by the entity selector
 */
export function transformEntitiesForSelector(
	entities?: Entities,
): Record<EntityType, Entity[]> {
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

function transformFactions(factions: Faction[]): Entity[] {
	return factions.map((faction) => ({
		id: faction.id,
		name: faction.name,
		content: faction.content || "",
		content_plain_text: faction.content_plain_text || "",
		tags: faction.tags,
		pinned: faction.pinned,
	}));
}

function transformLocations(locations: Location[]): Entity[] {
	return locations.map((location) => ({
		id: location.id,
		name: location.name,
		content: location.content || "",
		content_plain_text: location.content_plain_text || "",
		tags: location.tags,
		pinned: location.pinned,
	}));
}

function transformNotes(notes: Note[]): Entity[] {
	return notes.map((note) => ({
		id: note.id,
		name: note.name,
		content: note.content || "",
		content_plain_text: note.content_plain_text || "",
		tags: note.tags,
		pinned: note.pinned,
	}));
}

function transformQuests(quests: Quest[]): Entity[] {
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
