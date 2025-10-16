import { useListObjectivesQuery } from "~/api/@tanstack/react-query.gen";
import { Badge } from "~/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { useObjectiveMutations } from "./hooks/useObjectiveMutations";
import { ObjectiveForm } from "./objective-form";
import { ObjectiveItem } from "./objective-item";

interface ObjectivesViewProps {
	gameId: string;
	questId: string;
}

export function ObjectivesView({ gameId, questId }: ObjectivesViewProps) {
	const { data, isLoading } = useListObjectivesQuery({
		path: { game_id: gameId, quest_id: questId },
	});

	const { createObjective } = useObjectiveMutations({
		gameId,
		questId,
	});

	const objectives = data?.data || [];
	const completedCount = objectives.filter((obj) => obj.complete).length;
	const totalCount = objectives.length;

	if (isLoading) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-8">
					<div className="text-muted-foreground">Loading objectives...</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Quest Objectives</CardTitle>
						<CardDescription>
							Track your progress through this quest
						</CardDescription>
					</div>
					{totalCount > 0 && (
						<Badge
							variant={
								completedCount === totalCount ? "success" : "outline"
							}
						>
							{completedCount}/{totalCount} complete
						</Badge>
					)}
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<ObjectiveForm
					onSubmit={createObjective.mutate}
					isPending={createObjective.isPending}
				/>

				{objectives.length > 0 ? (
					<div className="space-y-2">
						{objectives.map((objective) => (
							<ObjectiveItem
								key={objective.id}
								gameId={gameId}
								objective={objective}
							/>
						))}
					</div>
				) : (
					<div className="text-muted-foreground text-sm text-center py-8 border-2 border-dashed rounded-lg">
						No objectives yet. Add one above to get started.
					</div>
				)}
			</CardContent>
		</Card>
	);
}
