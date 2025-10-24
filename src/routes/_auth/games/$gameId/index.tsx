import { createFileRoute } from "@tanstack/react-router";
import { Container } from "~/components/container";
import { NodeMap } from "~/components/dashboard/node-map";
import { StatCard } from "~/components/dashboard/stat-card";
import { Badge } from "~/components/ui/badge";
import { Link } from "~/components/ui/link";
import { useGetGameSuspenseQuery } from "~/queries/games";
import { useGetGameLinksData } from "~/queries/utils";

export const Route = createFileRoute("/_auth/games/$gameId/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { gameId } = Route.useParams();

	const { data: gameData } = useGetGameSuspenseQuery({ id: gameId });
	const game = gameData.data;

	const { characters, factions, locations, notes, quests, totalEntityCount } =
		useGetGameLinksData(gameId);

	return (
		<Container>
			<div className="space-y-6 mt-4">
				<div className="flex items-center justify-between">
					<div>
						<div className="flex items-center gap-5">
							<h1 className="text-3xl font-bold">Campaign Dashboard</h1>
							<Badge variant={"secondary"}>
								Entities: {totalEntityCount}
							</Badge>
						</div>
						<p>
							{game?.name} - {game?.content || "A TTRPG campaign"}
						</p>
					</div>
					<Link
						to="/games/$gameId/tree"
						params={{ gameId }}
						variant={"default"}
					>
						View Raw Data
					</Link>
				</div>

				<NodeMap gameId={gameId} />

				{/* Stats Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<StatCard
						title="Characters"
						value={characters?.length.toString() || "0"}
						href="/games/$gameId/characters"
					/>
					<StatCard
						title="Notes"
						value={notes?.length.toString() || "0"}
						href="/games/$gameId/notes"
					/>
					<StatCard
						title="Factions"
						value={factions?.length.toString() || "0"}
						href="/games/$gameId/factions"
					/>
					<StatCard
						title="Locations"
						value={locations?.length.toString() || "0"}
						href="/games/$gameId/locations"
					/>
					<StatCard
						title="Quests"
						value={quests?.length.toString() || "0"}
						href="/games/$gameId/quests"
					/>
				</div>
			</div>
		</Container>
	);
}
