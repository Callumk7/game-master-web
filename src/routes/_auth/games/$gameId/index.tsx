import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "~/components/stat-card";
import { Button } from "~/components/ui/button";
import { useGetGameLinksSuspenseQuery, useGetGameSuspenseQuery } from "~/queries/games";

export const Route = createFileRoute("/_auth/games/$gameId/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { gameId } = Route.useParams();

	const { data: gameData } = useGetGameSuspenseQuery({ id: gameId });
	const game = gameData.data;

	const { data: links } = useGetGameLinksSuspenseQuery({
		id: gameId,
	});
	const characters = links?.data?.entities?.characters;
	const factions = links?.data?.entities?.factions;
	const locations = links?.data?.entities?.locations;
	const notes = links?.data?.entities?.notes;
	const quests = links?.data?.entities?.quests;

	return (
		<div className="space-y-6 mt-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Campaign Dashboard</h1>
					<p>
						{game?.name} - {game?.content || "A TTRPG campaign"}
					</p>
				</div>
				<Button>View Graph</Button>
			</div>
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
	);
}
