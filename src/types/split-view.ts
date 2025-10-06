export type EntityType = "characters" | "factions" | "locations" | "notes" | "quests";

export interface EntityPath {
	type: EntityType;
	id: string;
}

export interface SplitViewState {
	leftPane?: EntityPath;
	rightPane?: EntityPath;
	leftSelectorOpen: boolean;
	rightSelectorOpen: boolean;
}

export interface EntityData {
	id: string;
	name: string;
	content: string;
	content_plain_text: string;
	tags?: string[];
	pinned?: boolean;
}

export interface Character extends EntityData {
	class?: string;
	level?: number;
}

export interface Faction extends EntityData {}

export interface Location extends EntityData {}

export interface Note extends EntityData {}

export interface Quest extends EntityData {
	status: string;
}

export type Entity = Character | Faction | Location | Note | Quest;

export interface EntityMutationPayload {
	content: string;
	content_plain_text: string;
}

export interface SplitViewContextValue {
	state: SplitViewState;
	updatePanes: (leftPane?: EntityPath, rightPane?: EntityPath) => void;
	openLeftSelector: () => void;
	openRightSelector: () => void;
	closeSelectors: () => void;
	closeSplitView: () => void;
}

export interface EntitySelectorState {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	filteredEntities: Record<EntityType, Entity[]>;
}
