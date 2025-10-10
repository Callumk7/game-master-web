import type { JSONContent } from "@tiptap/react";
import { useCreateLink } from "~/components/links/hooks/useCreateLink";
import type { EntityType } from "~/types";
import { extractMentionsFromJSON, getUniqueMentions } from "../mention-utils";

interface SourceEntity {
	gameId: string;
	type: EntityType;
	id: string;
}

export function useCreateLinksFromMentions() {
	const createLink = useCreateLink(
		() => {
			// Success callback - do nothing, keep it invisible
		},
		(error) => {
			// Error callback - log but don't show to user
			console.warn("Failed to create mention link:", error);
		},
	);

	const createLinksFromMentions = async (
		editorJson: JSONContent,
		sourceEntity: SourceEntity,
	) => {
		// Extract mentions from editor content
		const allMentions = extractMentionsFromJSON(editorJson);
		const uniqueMentions = getUniqueMentions(allMentions);

		// Create links for each mention
		const linkPromises = uniqueMentions.map(async (mention) => {
			try {
				await createLink.mutateAsync({
					gameId: sourceEntity.gameId,
					sourceType: sourceEntity.type,
					sourceId: sourceEntity.id,
					entity_type: mention.type,
					entity_id: mention.id,
					relationship_type: "", // Empty as requested
					description: "", // Empty as requested
				});
			} catch (error: unknown) {
				// Silently ignore duplicate link errors and other expected errors
				if (
					!(error instanceof Error) ||
					(!error.message?.includes("already exists") &&
					!error.message?.includes("duplicate"))
				) {
					console.warn(
						`Failed to create mention link to ${mention.type}:${mention.id}:`,
						error,
					);
				}
				// Continue processing other mentions even if one fails
			}
		});

		// Wait for all link creation attempts to complete
		await Promise.allSettled(linkPromises);
	};

	return {
		createLinksFromMentions,
		isCreatingLinks: createLink.isPending,
	};
}
