import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { listGamesOptions } from "~/api/@tanstack/react-query.gen";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function GamesList() {
	const { data: games, error } = useSuspenseQuery(listGamesOptions());

	const navigate = useNavigate();

	return (
		<>
			{error && <div>Error: {error.message}</div>}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 m-10">
				{games.data?.map((game) => (
					<Card
						key={game.id}
						className="group cursor-pointer hover:bg-primary transition-colors ease-in-out duration-200 "
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
							<CardDescription className="group-hover:text-primary-foreground transition-colors ease-in-out duration-200">
								{game.content}
							</CardDescription>
						</CardHeader>
					</Card>
				))}
			</div>
		</>
	);
}
