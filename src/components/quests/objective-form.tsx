import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

interface ObjectiveFormProps {
	onSubmit: (text: string) => void;
	isPending: boolean;
}

export function ObjectiveForm({ onSubmit, isPending }: ObjectiveFormProps) {
	const [newObjectiveText, setNewObjectiveText] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newObjectiveText.trim()) return;

		onSubmit(newObjectiveText.trim());
		setNewObjectiveText("");
	};

	return (
		<form onSubmit={handleSubmit} className="flex gap-2">
			<Input
				type="text"
				value={newObjectiveText}
				onChange={(e) => setNewObjectiveText(e.target.value)}
				placeholder="Add new objective..."
				className="flex-1"
			/>
			<Button
				type="submit"
				disabled={!newObjectiveText.trim() || isPending}
				size="sm"
			>
				{isPending ? "Adding..." : "Add"}
			</Button>
		</form>
	);
}
