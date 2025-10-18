import { useGetQuestQuery } from "~/api/@tanstack/react-query.gen";
import type { Objective } from "~/api/types.gen";
import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/utils/cn";
import { Spinner } from "../ui/spinner";
import { useObjectiveMutations } from "./hooks/useObjectiveMutations";

interface ObjectiveItemProps {
	gameId: string;
	objective: Objective;
	isGameList?: boolean;
}

export function ObjectiveItem({ objective, gameId, isGameList }: ObjectiveItemProps) {
	const { toggleComplete } = useObjectiveMutations({
		gameId,
		questId: objective.quest_id,
		isGameList,
	});

	const { data: questResponse, isLoading } = useGetQuestQuery({
		path: { game_id: gameId, id: objective.quest_id },
	});

	const quest = questResponse?.data;

	return (
		<div className="py-3 flex items-center gap-3">
			<Checkbox
				checked={objective.complete}
				onCheckedChange={() => toggleComplete(objective.id, objective.complete)}
			/>
			<div className="flex-1 flex flex-col gap-1">
				{isLoading && <Spinner className="w-4 h-4" />}
				{quest && <p className="text-xs text-primary">{quest.name}</p>}
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
