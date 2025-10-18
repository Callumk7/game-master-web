import type { EntityCollection, EntityType } from ".";

export interface EntityPath {
	type: EntityType;
	id: string;
}

export interface EntityMutationPayload {
	content: string;
	content_plain_text: string;
}

export interface EntitySelectorState {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	filteredEntities: EntityCollection;
}
