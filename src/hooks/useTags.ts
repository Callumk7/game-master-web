import * as React from "react";

export function useTags() {
	const [tags, setTags] = React.useState<string[]>([]);
	const [newTag, setNewTag] = React.useState("");

	const addTag = () => {
		if (newTag.trim() && !tags.includes(newTag)) {
			setTags([...tags, newTag]);
			setNewTag("");
		}
	};

	const removeTag = (tag: string) => {
		setTags(tags.filter((t) => t !== tag));
	};

	return { tags, newTag, setNewTag, addTag, removeTag };
}
