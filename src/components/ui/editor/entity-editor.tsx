import type { JSONContent } from "@tiptap/react";
import { AlertCircle, Check } from "lucide-react";
import * as React from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { EntityType } from "~/types";
import { useEditorContentActions } from "./hooks";
import { useCreateLinksFromMentions } from "./hooks/useCreateLinksFromMentions";
import { useDraftState } from "./hooks/useDraftState";
import { usePersistence } from "./hooks/usePersistence";
import { Tiptap } from "./index";
import { parseContentForEditor } from "./utils";

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
	onSave: (payload: {
		content: string;
		content_plain_text: string;
	}) => void | Promise<void>;
	/** Whether the save operation is currently pending */
	isSaving?: boolean;
	/** Custom save button text */
	saveButtonText?: string;
	/** Custom save button variant */
	saveButtonVariant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
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
	// Memoize parsed server content to avoid creating new objects on every render
	const parsedServerContent = React.useMemo(
		() =>
			(typeof content === "object"
				? content
				: parseContentForEditor(content)) as JSONContent | null,
		[content],
	);

	// Initialize persistence hook
	const persistence = usePersistence({
		gameId,
		entityType,
		entityId,
	});

	// Counter to force remount when discarding draft (stays 0 unless explicitly incremented)
	const [discardCounter, setDiscardCounter] = React.useState(0);

	// Derive editor content synchronously - no async state updates needed!
	// This recomputes whenever entityId or parsedServerContent changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: entityId and discardCounter are intentional - we want to recompute when navigating or discarding
	const { editorContent, draftTimestamp } = React.useMemo(() => {
		const draft = persistence.loadDraft();

		if (draft?.content) {
			// Use draft if it exists
			return {
				editorContent: draft.content,
				draftTimestamp: draft.timestamp,
			};
		}

		// Use server content
		return {
			editorContent: parsedServerContent,
			draftTimestamp: undefined,
		};
	}, [entityId, parsedServerContent, persistence, discardCounter]);

	const {
		isUpdated,
		onChange: onContentChange,
		getPayload,
		updatedContent,
		resetState,
	} = useEditorContentActions({
		serverContent: parsedServerContent,
	});

	const { createLinksFromMentions, isCreatingLinks } =
		useCreateLinksFromMentions();

	// Track if this is the first onChange (initial mount) to prevent marking as dirty
	const isFirstChange = React.useRef(true);

	// Reset the firstChange flag when entity changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: entityId is intentional - we want to reset when navigating to a different entity
	React.useEffect(() => {
		isFirstChange.current = true;
	}, [entityId]);

	// Draft state tracking
	const draftState = useDraftState({
		currentContent: (updatedContent.json as JSONContent) || null,
		serverContent: parsedServerContent,
		draftTimestamp,
		serverTimestamp: Date.now(), // TODO: Get actual server timestamp from entity metadata
	});

	// Save draft to localStorage whenever content changes
	const onChange = React.useCallback(
		(newContent: { json: object; text: string }) => {
			// Skip marking as updated on the very first onChange (initial load)
			if (isFirstChange.current) {
				isFirstChange.current = false;
				return;
			}

			onContentChange(newContent);
			// Save to localStorage (debounced internally)
			persistence.saveDraft(newContent.json as JSONContent, Date.now());
		},
		[onContentChange, persistence],
	);

	const handleSave = async () => {
		// Get the payload for this entity type
		const payload = getPayload(entityType)[entityType];

		// Call the provided save function
		await onSave(payload);

		// Clear the draft from localStorage after successful save
		persistence.clearDraft();

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

		resetState();
	};

	const handleDiscardDraft = React.useCallback(() => {
		// Clear localStorage
		persistence.clearDraft();
		resetState();

		// Force re-render of editor by updating the discard counter
		// This causes useMemo to recompute and Tiptap to remount with server content
		setDiscardCounter((prev) => prev + 1);
	}, [persistence, resetState]);

	return (
		<div className={`space-y-4 ${className || ""}`}>
			<div className="flex items-center gap-2 flex-wrap">
				<Button
					variant={saveButtonVariant}
					onClick={handleSave}
					disabled={!isUpdated || isSaving || isCreatingLinks}
				>
					{isSaving || isCreatingLinks ? "Saving..." : saveButtonText}
				</Button>
				{draftState.hasUnsavedChanges && (
					<Button
						variant="ghost"
						onClick={handleDiscardDraft}
						disabled={isSaving || isCreatingLinks}
					>
						Discard Draft
					</Button>
				)}
				{draftState.hasUnsavedChanges ? (
					<Badge variant="warning">
						<AlertCircle />
						Unsaved Changes
					</Badge>
				) : (
					!isSaving &&
					!isCreatingLinks && (
						<Badge variant="success">
							<Check />
							Saved
						</Badge>
					)
				)}
			</div>
			<Tiptap
				key={`${entityId}-${discardCounter}`}
				entityId={entityId}
				entityType={entityType}
				content={editorContent}
				onChange={onChange}
			/>
			<div className="flex items-center gap-2 flex-wrap">
				<Button
					variant={saveButtonVariant}
					onClick={handleSave}
					disabled={!isUpdated || isSaving || isCreatingLinks}
				>
					{isSaving || isCreatingLinks ? "Saving..." : saveButtonText}
				</Button>
				{draftState.hasUnsavedChanges && (
					<Button
						variant="ghost"
						onClick={handleDiscardDraft}
						disabled={isSaving || isCreatingLinks}
					>
						Discard Draft
					</Button>
				)}
				{draftState.hasUnsavedChanges ? (
					<Badge variant="warning">
						<AlertCircle />
						Unsaved Changes
					</Badge>
				) : (
					!isSaving &&
					!isCreatingLinks && (
						<Badge variant="success">
							<Check />
							Saved
						</Badge>
					)
				)}
			</div>
		</div>
	);
}
