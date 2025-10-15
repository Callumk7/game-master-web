import * as React from "react";
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
	className?: string;
}

export function EntityEditor({
	content,
	gameId,
	entityType,
	entityId,
	onSave,
	className,
}: EntityEditorProps) {
	const { isUpdated, setIsUpdated, onChange, getPayload, updatedContent } =
		useEditorContentActions();
	const { createLinksFromMentions } = useCreateLinksFromMentions();
	const [autoSaveStatus, setAutoSaveStatus] = React.useState<'idle' | 'saving' | 'saved'>('idle');

	// Memoize parsed content to avoid creating new objects on every render
	const parsedContent = React.useMemo(
		() => (typeof content === "object" ? content : parseContentForEditor(content)),
		[content],
	);

	// Debounced auto-save effect
	React.useEffect(() => {
		if (!isUpdated) {
			return;
		}

		setAutoSaveStatus('idle');

		// Debounce the save operation by 750ms
		const timeoutId = setTimeout(async () => {
			setAutoSaveStatus('saving');

			try {
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
				setAutoSaveStatus('saved');

				// Reset to idle after 2 seconds
				setTimeout(() => setAutoSaveStatus('idle'), 2000);
			} catch (error) {
				console.error("Auto-save failed:", error);
				setAutoSaveStatus('idle');
			}
		}, 750);

		return () => clearTimeout(timeoutId);
	}, [isUpdated, entityType, getPayload, onSave, updatedContent, createLinksFromMentions, gameId, entityId, setIsUpdated]);

	return (
		<div className={`space-y-4 ${className || ""}`}>
			{/* Auto-save status indicator */}
			<div className="flex items-center justify-end h-6 text-sm text-muted-foreground">
				{autoSaveStatus === 'saved' ? (
					<span className="text-green-600 dark:text-green-400">Saved</span>
				) : isUpdated ? (
					<span>Updated</span>
				) : null}
			</div>
			<Tiptap
				key={entityId}
				entityId={entityId}
				entityType={entityType}
				content={parsedContent}
				onChange={onChange}
			/>
		</div>
	);
}
