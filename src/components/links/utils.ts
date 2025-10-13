import type { EntityType } from "~/types";
import type { EntityLink, GenericLinksResponse } from "./types";

export function flattenLinksForTable(linksResponse: GenericLinksResponse): EntityLink[] {
	const { links } = linksResponse.data;
	const flattenedLinks: EntityLink[] = [];

	Object.entries(links).forEach(([type, entities]) => {
		entities.forEach((entity) => {
			flattenedLinks.push({
				id: entity.id,
				name: entity.name,
				type: type.slice(0, -1) as EntityType, // Remove 's' from plural (factions -> faction)
				relationship_type: entity.relationship_type,
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
				// Special fields for specific link types
				is_current_location:
					"is_current_location" in entity &&
					typeof entity.is_current_location === "boolean"
						? entity.is_current_location
						: undefined,
				is_primary:
					"is_primary" in entity && typeof entity.is_primary === "boolean"
						? entity.is_primary
						: undefined,
				faction_role:
					"faction_role" in entity && typeof entity.faction_role === "string"
						? entity.faction_role
						: undefined,
			});
		});
	});

	return flattenedLinks;
}
