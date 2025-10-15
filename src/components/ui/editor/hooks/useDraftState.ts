import * as React from "react";
import type { JSONContent } from "@tiptap/react";

interface DraftStateOptions {
	currentContent: JSONContent | null;
	serverContent: JSONContent | null;
	draftTimestamp?: number;
	serverTimestamp?: number;
}

interface DraftState {
	/** True if current content differs from server content */
	isDirty: boolean;
	/** True if there are unsaved changes (same as isDirty for now) */
	hasUnsavedChanges: boolean;
	/** Age of draft in milliseconds, undefined if no draft */
	draftAge?: number;
	/** True if local content is "newer" than server (based on timestamps) */
	isLocalNewer: boolean;
}

/**
 * Hook for tracking draft state and comparing with server content
 */
export function useDraftState({
	currentContent,
	serverContent,
	draftTimestamp,
	serverTimestamp,
}: DraftStateOptions): DraftState {
	const isDirty = React.useMemo(() => {
		if (!currentContent || !serverContent) return false;

		// Compare content by stringifying
		// This is simple but may have false positives due to key ordering
		try {
			return (
				JSON.stringify(currentContent) !== JSON.stringify(serverContent)
			);
		} catch {
			return false;
		}
	}, [currentContent, serverContent]);

	const draftAge = React.useMemo(() => {
		if (!draftTimestamp) return undefined;
		return Date.now() - draftTimestamp;
	}, [draftTimestamp]);

	const isLocalNewer = React.useMemo(() => {
		// If we don't have both timestamps, can't compare
		if (!draftTimestamp || !serverTimestamp) {
			// If we have unsaved changes, consider local as "newer"
			return isDirty;
		}

		// Compare timestamps
		return draftTimestamp > serverTimestamp;
	}, [draftTimestamp, serverTimestamp, isDirty]);

	return {
		isDirty,
		hasUnsavedChanges: isDirty,
		draftAge,
		isLocalNewer,
	};
}
