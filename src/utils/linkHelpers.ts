import type {
	LinkedCharacter,
	LinkedFaction,
	LinkedLocation,
	LinkedNote,
	LinkedQuest,
} from "~/api/types.gen";

export interface EntityLink {
	id: string;
	name: string;
	type: string;
	description?: string;
	content?: string;
	content_plain_text?: string;
	relationship_type?: string;
	is_active?: boolean;
	description_meta?: string;
	metadata?: {
		[key: string]: unknown;
	};
	strength?: number;
	tags?: Array<unknown>;
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

export function flattenLinksForTable(linksResponse: GenericLinksResponse): EntityLink[] {
	const { links } = linksResponse.data;
	const flattenedLinks: EntityLink[] = [];

	Object.entries(links).forEach(([type, entities]) => {
		entities.forEach((entity) => {
			flattenedLinks.push({
				id: entity.id,
				name: entity.name,
				type: type.slice(0, -1), // Remove 's' from plural (factions -> faction)
				relationship_type: entity.relationship_type,
				description: "description" in entity ? entity.description : undefined,
				content:
					"content" in entity && typeof entity.content === "string"
						? entity.content
						: undefined,
				content_plain_text:
					"content_plain_text" in entity &&
					typeof entity.content_plain_text === "string"
						? entity.content_plain_text
						: undefined,
				is_active: entity.is_active,
				metadata: entity.metadata,
				strength: entity.strength,
				tags: entity.tags,
				description_meta: entity.description_meta,
			});
		});
	});

	return flattenedLinks;
}
