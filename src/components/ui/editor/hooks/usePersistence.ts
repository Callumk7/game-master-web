import * as React from "react";
import type { JSONContent } from "@tiptap/react";
import type { EntityType } from "~/types";

interface DraftData {
	content: JSONContent;
	timestamp: number;
	serverTimestamp?: number;
}

interface UsePersistenceOptions {
	gameId: string;
	entityType: EntityType;
	entityId: string;
	debounceMs?: number;
}

/**
 * Hook for managing localStorage persistence of editor drafts
 * Scoped to specific entities using gameId-entityType-entityId
 */
export function usePersistence({
	gameId,
	entityType,
	entityId,
	debounceMs = 800,
}: UsePersistenceOptions) {
	const storageKey = React.useMemo(
		() => `editor-draft-${gameId}-${entityType}-${entityId}`,
		[gameId, entityType, entityId],
	);

	// Debounced save to localStorage
	const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);

	const saveDraft = React.useCallback(
		(content: JSONContent, serverTimestamp?: number) => {
			// Clear any pending save
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			// Debounce the actual save
			timeoutRef.current = setTimeout(() => {
				try {
					const draft: DraftData = {
						content,
						timestamp: Date.now(),
						serverTimestamp,
					};
					localStorage.setItem(storageKey, JSON.stringify(draft));
				} catch (error) {
					// Handle localStorage errors (quota exceeded, disabled, etc.)
					console.warn("Failed to save draft to localStorage:", error);
				}
			}, debounceMs);
		},
		[storageKey, debounceMs],
	);

	const loadDraft = React.useCallback((): DraftData | null => {
		try {
			const stored = localStorage.getItem(storageKey);
			if (!stored) return null;

			const draft = JSON.parse(stored) as DraftData;
			// Validate the structure
			if (draft.content && draft.timestamp) {
				return draft;
			}
			return null;
		} catch (error) {
			console.warn("Failed to load draft from localStorage:", error);
			return null;
		}
	}, [storageKey]);

	const clearDraft = React.useCallback(() => {
		try {
			localStorage.removeItem(storageKey);
			// Also clear any pending debounced save
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		} catch (error) {
			console.warn("Failed to clear draft from localStorage:", error);
		}
	}, [storageKey]);

	const hasDraft = React.useCallback((): boolean => {
		try {
			return localStorage.getItem(storageKey) !== null;
		} catch {
			return false;
		}
	}, [storageKey]);

	// Cleanup on unmount
	React.useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return {
		saveDraft,
		loadDraft,
		clearDraft,
		hasDraft,
		storageKey,
	};
}
