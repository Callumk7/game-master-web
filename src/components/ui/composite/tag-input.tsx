import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "../badge";
import { Input } from "../input";
import { Button } from "../button";

interface TagInputProps {
	value: string[];
	onChange: (tags: string[]) => void;
	placeholder?: string;
	disabled?: boolean;
}

export function TagInput({
	value = [],
	onChange,
	placeholder = "Add a tag",
	disabled = false,
}: TagInputProps) {
	const [newTag, setNewTag] = useState("");

	const addTag = () => {
		if (newTag.trim() && !value.includes(newTag.trim())) {
			onChange([...value, newTag.trim()]);
			setNewTag("");
		}
	};

	const removeTag = (tagToRemove: string) => {
		onChange(value.filter((tag) => tag !== tagToRemove));
	};

	return (
		<div className="space-y-2">
			<div className="flex flex-wrap gap-2 mb-2">
				{value.map((tag) => (
					<Badge
						key={tag}
						variant="secondary"
						className="flex items-center gap-1"
					>
						{tag}
						{!disabled && (
							<button
								type="button"
								onClick={() => removeTag(tag)}
								className="ml-1 hover:text-destructive"
							>
								<X className="w-3 h-3" />
							</button>
						)}
					</Badge>
				))}
			</div>
			{!disabled && (
				<div className="flex gap-2">
					<Input
						value={newTag}
						onChange={(e) => setNewTag(e.target.value)}
						placeholder={placeholder}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								addTag();
							}
						}}
					/>
					<Button type="button" onClick={addTag} variant="outline" size="icon">
						<Plus className="w-4 h-4" />
					</Button>
				</div>
			)}
		</div>
	);
}
