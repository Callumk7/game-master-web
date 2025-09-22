export const parseContentForEditor = (content?: string) => {
	if (!content) return null;

	try {
		const parsed = JSON.parse(content);
		if (parsed && typeof parsed === "object" && parsed.type) {
			return parsed;
		}
	} catch {
		// Not JSON, continue to plain text handling
	}

	return {
		type: "doc",
		content: [
			{
				type: "paragraph",
				content: [
					{
						type: "text",
						text: content,
					},
				],
			},
		],
	};
};