import * as React from "react";
import type { JSONContent } from "@tiptap/react";
import type { EntityType } from "~/types";

type PayloadMap = {
	[K in EntityType]: {
		content: string;
		content_plain_text: string;
	};
};

interface UseEditorContentActionsOptions {
	/** Initial server content for comparison */
	serverContent?: JSONContent | null;
}

export const useEditorContentActions = (
	options?: UseEditorContentActionsOptions,
) => {
	const [isUpdated, setIsUpdated] = React.useState(false);
	const [updatedContent, setUpdatedContent] = React.useState<{
		json: object;
		text: string;
	}>({ json: {}, text: "" });
	const [hasDraft, setHasDraft] = React.useState(false);

	// Store server content for comparison
	const serverContentRef = React.useRef(options?.serverContent);

	// Update server content ref when it changes
	React.useEffect(() => {
		serverContentRef.current = options?.serverContent;
	}, [options?.serverContent]);

	const onChange = (newContent: { json: object; text: string }) => {
		setUpdatedContent(newContent);
		setIsUpdated(true);
		setHasDraft(true);
	};

	const getPayload = <T extends EntityType>(type: T): Pick<PayloadMap, T> => {
		return {
			[type]: {
				content: JSON.stringify(updatedContent.json),
				content_plain_text: updatedContent.text,
			},
		} as Pick<PayloadMap, T>;
	};

	const resetState = () => {
		setIsUpdated(false);
		setHasDraft(false);
	};

	return {
		isUpdated,
		setIsUpdated,
		onChange,
		getPayload,
		updatedContent,
		hasDraft,
		setHasDraft,
		resetState,
		serverContent: serverContentRef.current,
	};
};
