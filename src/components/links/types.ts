import type {
	LinkedCharacter,
	LinkedFaction,
	LinkedLocation,
	LinkedNote,
	LinkedQuest,
	LinkRequest,
} from "~/api/types.gen";
import type { EntityType } from "~/types";

export interface EntityOption {
	label: string;
	value: string;
	type: EntityType;
}

export interface CreateLinkParams extends LinkRequest {
	gameId: string;
	sourceType: EntityType;
	sourceId: string;
}

export interface EntityLink {
	id: string;
	name: string;
	type: EntityType;
	content?: string;
	content_plain_text?: string;
	relationship_type?: string;
	is_active?: boolean;
	description_meta?: string;
	metadata?: {
		[key: string]: unknown;
	};
	strength?: number;
	tags?: Array<string>;

	// Special fields for specific link types
	is_current_location?: boolean; // character-location, faction-location
	is_primary?: boolean; // character-faction
	faction_role?: string; // character-faction
}

export interface GenericLinksResponse {
	data: {
		links: {
			characters: LinkedCharacter[];
			factions: LinkedFaction[];
			notes: LinkedNote[];
			locations: LinkedLocation[];
			quests: LinkedQuest[];
		};
	};
}
