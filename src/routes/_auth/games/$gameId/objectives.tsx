import { createFileRoute } from "@tanstack/react-router";
import {
	listGameObjectivesOptions,
	useListGameObjectivesQuery,
} from "~/api/@tanstack/react-query.gen";
import { Container } from "~/components/container";
import { ObjectiveItem } from "~/components/quests/objective-item";
import { Badge } from "~/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";

export const Route = createFileRoute("/_auth/games/$gameId/objectives")({
	component: RouteComponent,
	loader: ({ context, params }) => {
		context.queryClient.ensureQueryData(
			listGameObjectivesOptions({ path: { game_id: params.gameId } }),
		);
	},
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	const { data, isLoading } = useListGameObjectivesQuery({ path: { game_id: gameId } });

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
		<Container>
			<Card className="max-w-xl mx-auto">
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
					{objectives.length > 0 ? (
						<div className="space-y-2">
							{objectives.map((objective) => (
								<ObjectiveItem
									key={objective.id}
									gameId={gameId}
									objective={objective}
									isGameList
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
		</Container>
	);
}
