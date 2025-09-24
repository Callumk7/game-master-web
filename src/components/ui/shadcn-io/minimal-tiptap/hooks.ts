import * as React from "react";
import type { EntityType } from "~/types";

type PayloadMap = {
	[K in EntityType]: {
		content: string;
		content_plain_text: string;
	};
};

export const useEditorContentActions = () => {
	const [isUpdated, setIsUpdated] = React.useState(false);
	const [updatedContent, setUpdatedContent] = React.useState<{
		json: object;
		text: string;
	}>({ json: {}, text: "" });

	const onChange = (newContent: { json: object; text: string }) => {
		setUpdatedContent(newContent);
		setIsUpdated(true);
	};

	const getPayload = <T extends EntityType>(type: T): Pick<PayloadMap, T> => {
		return {
			[type]: {
				content: JSON.stringify(updatedContent.json),
				content_plain_text: updatedContent.text,
			},
		} as Pick<PayloadMap, T>;
	};

	return {
		isUpdated,
		setIsUpdated,
		onChange,
		getPayload,
	};
};
