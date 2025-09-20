import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";

interface EntityHeaderProps {
	entityType: string;
	onCreateNew: () => void;
}

export function EntityHeader({ entityType, onCreateNew }: EntityHeaderProps) {
	return (
		<div className="flex items-center justify-end">
			<Button onClick={onCreateNew} size={"sm"}>
				<Plus className="w-4 h-4 mr-2" />
				New {entityType}
			</Button>
		</div>
	);
}

