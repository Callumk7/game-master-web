import { createFileRoute } from "@tanstack/react-router";
import {
	getGameEntityTreeOptions,
	useGetGameEntityTreeQuery,
} from "~/api/@tanstack/react-query.gen";
import { NodeMap } from "~/components/node-map";
import { StatCard } from "~/components/stat-card";
import { Link } from "~/components/ui/link";
import { useGetGameLinksSuspenseQuery, useGetGameSuspenseQuery } from "~/queries/games";

export const Route = createFileRoute("/_auth/games/$gameId/")({
	component: RouteComponent,
	loader: async ({ params, context }) => {
		await context.queryClient.ensureQueryData(
			getGameEntityTreeOptions({ path: { game_id: params.gameId } }),
		);
	},
});

function RouteComponent() {
	const { gameId } = Route.useParams();

	const { data: gameData } = useGetGameSuspenseQuery({ id: gameId });
	const game = gameData.data;

	const { data: entityTreeData } = useGetGameEntityTreeQuery({
		path: { game_id: gameId },
	});

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
				<Link to="/games/$gameId/tree" params={{ gameId }} variant={"default"}>
					View Raw Data
				</Link>
			</div>

			{/* Node Map Visualization */}
			{entityTreeData?.data && (
				<NodeMap data={entityTreeData.data} gameId={gameId} />
			)}

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
	);
}
