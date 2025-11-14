import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { listGamesOptions } from "~/api/@tanstack/react-query.gen";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function GamesList() {
	const { data: games, error } = useSuspenseQuery(listGamesOptions());

	const navigate = useNavigate();

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			{error && (
				<div className="text-destructive text-sm mb-4">
					Error: {error.message}
				</div>
			)}
			{games.data && games.data.length > 0 ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{games.data.map((game) => (
						<Card
							key={game.id}
							className="group cursor-pointer hover:bg-secondary transition-colors ease-in-out duration-200"
							onClick={() =>
								navigate({
									to: "/games/$gameId",
									from: "/games",
									params: { gameId: game.id },
								})
							}
						>
							<CardHeader>
								<CardTitle>{game.name}</CardTitle>
								<CardDescription className="group-hover:text-secondary-foreground transition-colors ease-in-out duration-200">
									{game.content}
								</CardDescription>
							</CardHeader>
						</Card>
					))}
				</div>
			) : (
				<div className="text-center text-muted-foreground py-12">
					<p className="text-lg mb-4">No games yet</p>
					<p className="text-sm">Create your first game to get started!</p>
				</div>
			)}
		</div>
	);
}
