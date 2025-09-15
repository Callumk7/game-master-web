import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { listGamesOptions } from "~/api/@tanstack/react-query.gen";
import type { Game } from "~/api/types.gen";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";

export function GamesList() {
	const { data } = useQuery({ ...listGamesOptions() });

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Game</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{data?.data?.map((game: Game) => (
					<TableRow key={game.id}>
						<TableCell>
							<Link
								to="/games/$gameId"
								params={{ gameId: game.id.toString() }}
								className="text-blue-600 hover:underline"
							>
								{game.name || `Game ${game.id}`}
							</Link>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

