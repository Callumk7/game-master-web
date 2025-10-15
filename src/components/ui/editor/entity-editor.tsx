import * as React from "react";
import { Button } from "~/components/ui/button";
import type { EntityType } from "~/types";
import { useEditorContentActions } from "./hooks";
import { useCreateLinksFromMentions } from "./hooks/useCreateLinksFromMentions";
import { Tiptap } from "./index";
import { parseContentForEditor } from "./utils";

interface EntityEditorProps {
	content?: string | object | null;
	gameId: string;
	entityType: EntityType;
	entityId: string;
	onSave: (payload: {
		content: string;
		content_plain_text: string;
	}) => void | Promise<void>;
	isSaving?: boolean;
	saveButtonText?: string;
	saveButtonVariant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
	className?: string;
}

export function EntityEditor({
	content,
	gameId,
	entityType,
	entityId,
	onSave,
	isSaving = false,
	saveButtonText = "Save",
	saveButtonVariant = "secondary",
	className,
}: EntityEditorProps) {
	const { isUpdated, setIsUpdated, onChange, getPayload, updatedContent } =
		useEditorContentActions();
	const { createLinksFromMentions, isCreatingLinks } = useCreateLinksFromMentions();

	// Memoize parsed content to avoid creating new objects on every render
	const parsedContent = React.useMemo(
		() => (typeof content === "object" ? content : parseContentForEditor(content)),
		[content],
	);

	const handleSave = async () => {
		// Get the payload for this entity type
		const payload = getPayload(entityType)[entityType];

		// Call the provided save function
		await onSave(payload);

		// Create links from mentions (runs in background)
		if (updatedContent.json) {
			try {
				await createLinksFromMentions(updatedContent.json, {
					gameId,
					type: entityType,
					id: entityId,
				});
			} catch (error) {
				// Silently handle errors - user doesn't need to know about mention link failures
				console.warn("Some mention links failed to create:", error);
			}
		}

		setIsUpdated(false);
	};

	return (
		<div className={`space-y-4 ${className || ""}`}>
			<Button
				variant={saveButtonVariant}
				onClick={handleSave}
				disabled={!isUpdated || isSaving || isCreatingLinks}
			>
				{isSaving || isCreatingLinks ? "Saving..." : saveButtonText}
			</Button>
			<Tiptap
				key={entityId}
				entityId={entityId}
				entityType={entityType}
				content={parsedContent}
				onChange={onChange}
			/>
			<Button
				variant={saveButtonVariant}
				onClick={handleSave}
				disabled={!isUpdated || isSaving || isCreatingLinks}
			>
				{isSaving || isCreatingLinks ? "Saving..." : saveButtonText}
			</Button>
		</div>
	);
}
