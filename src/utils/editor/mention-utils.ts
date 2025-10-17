import type { JSONContent } from "@tiptap/react";

export interface ExtractedMention {
	id: string;
	type: "character" | "faction" | "location" | "note" | "quest";
	gameId: string;
	label: string;
}

/**
 * Recursively extract mention nodes from TipTap JSON content
 */
export function extractMentionsFromJSON(json: JSONContent): ExtractedMention[] {
	const mentions: ExtractedMention[] = [];

	function traverse(node: JSONContent) {
		// Check if this node is a mention
		if (node.type === "mention" && node.attrs) {
			const { id, type, gameId, label } = node.attrs;
			if (id && type && gameId && label) {
				mentions.push({
					id,
					type: type as ExtractedMention["type"],
					gameId,
					label,
				});
			}
		}

		// Recursively traverse child nodes
		if (node.content) {
			for (const child of node.content) {
				traverse(child);
			}
		}
	}

	traverse(json);
	return mentions;
}

/**
 * Get unique mentions (deduplicate by id + type combination)
 */
export function getUniqueMentions(mentions: ExtractedMention[]): ExtractedMention[] {
	const seen = new Set<string>();
	return mentions.filter((mention) => {
		const key = `${mention.type}:${mention.id}`;
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}
