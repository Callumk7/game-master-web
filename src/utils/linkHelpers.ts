import type {
	LinkedCharacter,
	LinkedFaction,
	LinkedLocation,
	LinkedNote,
	LinkedQuest,
} from "~/api/types.gen";
import type { EntityLink } from "~/components/ui/EntityLinksTable";

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
				description_plain_text:
					"description_plain_text" in entity
						? entity.description_plain_text
						: undefined,
				content:
					"content" in entity && typeof entity.content === "string"
						? entity.content
						: undefined,
				content_plain_text:
					"content_plain_text" in entity &&
					typeof entity.content_plain_text === "string"
						? entity.content_plain_text
						: undefined,
			});
		});
	});

	return flattenedLinks;
}
