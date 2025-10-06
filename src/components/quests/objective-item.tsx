import type { Objective } from "~/api/types.gen";
import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/utils/cn";

interface ObjectiveItemProps {
	objective: Objective;
	onToggleComplete: (id: string, currentComplete: boolean) => void;
}

export function ObjectiveItem({ objective, onToggleComplete }: ObjectiveItemProps) {
	return (
		<div className="py-3 flex items-center gap-3">
			<Checkbox
				checked={objective.complete}
				onCheckedChange={() => onToggleComplete(objective.id, objective.complete)}
			/>
			<div className="flex-1">
				<p
					className={cn(
						"text-sm",
						objective.complete && "line-through text-muted-foreground",
					)}
				>
					{objective.body}
				</p>
			</div>
		</div>
	);
}
