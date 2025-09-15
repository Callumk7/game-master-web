import type { EntityLink } from "~/components/ui/EntityLinksTable";

import type { EntityCharacter, EntityFaction, EntityLocation, EntityNote, EntityQuest } from "~/api/types.gen";

export interface GenericLinksResponse {
	data: {
		links: {
			characters: EntityCharacter[];
			factions: EntityFaction[];
			notes: EntityNote[];
			locations: EntityLocation[];
			quests: EntityQuest[];
		};
	};
}

// Deprecated - use GenericLinksResponse instead
export interface LinksResponse extends GenericLinksResponse {
	data: GenericLinksResponse["data"] & {
		character_id: number;
		character_name: string;
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
				description: "description" in entity ? entity.description : undefined,
				content: "content" in entity ? entity.content : undefined,
				created_at: entity.created_at || "",
				updated_at: entity.updated_at || "",
			});
		});
	});

	return flattenedLinks.sort(
		(a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
	);
}

