import { useGetLocationLinksQuery } from "~/api/@tanstack/react-query.gen";

interface NPCViewProps {
	gameId: string;
	locationId: string;
}

export function NPCView({ gameId, locationId }: NPCViewProps) {
	const { data: linkData, isLoading } = useGetLocationLinksQuery({
		path: { game_id: gameId, location_id: locationId },
	});

	if (isLoading) {
		return <div>Loading NPCs...</div>;
	}

	const links = linkData?.data;
	if (!links) {
		return <div>No NPCs found</div>;
	}

	const filteredNpcs = links.links?.characters?.filter(
		(character) => character.is_current_location === true,
	);

	const filteredFactions = links.links?.factions?.filter(
		(faction) => faction.is_current_location === true,
	);

	return (
		<div>
			<h1>NPCs</h1>
			<div>
				{filteredNpcs?.map((npc) => (
					<div key={npc.id}>
						<h2>{npc.name}</h2>
					</div>
				))}
			</div>
			<h1>Factions</h1>
			<div>
				{filteredFactions?.map((faction) => (
					<div key={faction.id}>
						<h2>{faction.name}</h2>
					</div>
				))}
			</div>
		</div>
	);
}
