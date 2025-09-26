import * as React from "react";
import { Button } from "~/components/ui/button";
import { Tiptap } from "./index";
import { useEditorContentActions } from "./hooks";
import { useCreateLinksFromMentions } from "./hooks/useCreateLinksFromMentions";
import { parseContentForEditor } from "./utils";
import type { EntityType } from "~/types";

interface EntityEditorProps {
	/** The entity's current content (JSON string or object) */
	content?: string | object | null;
	/** The game ID for creating mention links */
	gameId: string;
	/** The entity type (character, faction, location, note, quest) */
	entityType: EntityType;
	/** The entity ID for creating mention links */
	entityId: string;
	/** Callback when save is clicked - receives the payload to send to the server */
	onSave: (payload: { content: string; content_plain_text: string }) => void | Promise<void>;
	/** Whether the save operation is currently pending */
	isSaving?: boolean;
	/** Custom save button text */
	saveButtonText?: string;
	/** Custom save button variant */
	saveButtonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
	/** Additional className for the container */
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
	const { isUpdated, setIsUpdated, onChange, getPayload, updatedContent } = useEditorContentActions();
	const { createLinksFromMentions, isCreatingLinks } = useCreateLinksFromMentions();

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
			<Tiptap
				content={parseContentForEditor(content)}
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
