import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, Plus } from "lucide-react";
import { listGamesOptions } from "~/api/@tanstack/react-query.gen";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

const formatUpdatedAt = (updatedAt?: string) => {
	if (!updatedAt) {
		return "Recently updated";
	}

	const parsedDate = new Date(updatedAt);

	if (Number.isNaN(parsedDate.getTime())) {
		return "Recently updated";
	}

	return `Updated ${parsedDate.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	})}`;
};

export function GamesList() {
	const { data: games, error } = useSuspenseQuery(listGamesOptions());
	const navigate = useNavigate();

	const sortedGames = [...(games.data ?? [])].sort((a, b) => {
		const firstDate = a.updated_at ? new Date(a.updated_at).getTime() : 0;
		const secondDate = b.updated_at ? new Date(b.updated_at).getTime() : 0;
		return secondDate - firstDate;
	});

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
			<section className="rounded-xl border bg-card p-6 sm:p-8">
				<div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
					<div className="space-y-2">
						<Badge variant="secondary">Campaigns</Badge>
						<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
							Your Games
						</h1>
						<p className="text-sm text-muted-foreground sm:text-base">
							Choose a campaign to jump back in, or start a new world.
						</p>
					</div>
					<Button
						onClick={() => navigate({ to: "/games/new", from: "/games" })}
					>
						<Plus className="h-4 w-4" />
						Create Game
					</Button>
				</div>
			</section>

			{error && (
				<div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
					Failed to load games: {error.message}
				</div>
			)}

			{sortedGames.length > 0 ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{sortedGames.map((game) => (
						<Card
							key={game.id}
							className="group cursor-pointer border-border/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
							onClick={() =>
								navigate({
									to: "/games/$gameId",
									from: "/games",
									params: { gameId: game.id },
								})
							}
						>
							<CardHeader className="space-y-4">
								<div className="flex items-start justify-between gap-3">
									<div className="space-y-1">
										<CardTitle className="line-clamp-2 text-lg leading-tight">
											{game.name}
										</CardTitle>
										{game.setting && (
											<Badge
												variant="outline"
												className="text-xs font-normal"
											>
												{game.setting}
											</Badge>
										)}
									</div>
									<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
								</div>
								<CardDescription className="line-clamp-3 min-h-14 text-sm leading-relaxed">
									{game.content?.trim() ||
										"No description yet. Open this campaign to start building your world."}
								</CardDescription>
								<div className="flex items-center gap-2 text-xs text-muted-foreground">
									<CalendarDays className="h-3.5 w-3.5" />
									<span>{formatUpdatedAt(game.updated_at)}</span>
								</div>
							</CardHeader>
						</Card>
					))}
				</div>
			) : (
				<Card className="border-dashed">
					<CardHeader className="items-center py-12 text-center">
						<CardTitle className="text-xl">No games yet</CardTitle>
						<CardDescription className="max-w-md">
							Create your first campaign to start tracking characters,
							quests, and locations in one place.
						</CardDescription>
						<Button
							className="mt-2"
							onClick={() => navigate({ to: "/games/new", from: "/games" })}
						>
							<Plus className="h-4 w-4" />
							Create your first game
						</Button>
					</CardHeader>
				</Card>
			)}
		</div>
	);
}
