import {
	useGetFactionMembersQuery,
	useGetFactionQuery,
} from "~/api/@tanstack/react-query.gen";
import { Example } from "~/lib/react-flow/example";

interface FactionChartProps {
	gameId: string;
	factionId: string;
}

export function FactionChart({ gameId, factionId }: FactionChartProps) {
	const { data: factionResponse } = useGetFactionQuery({
		path: { game_id: gameId, id: factionId },
	});
	const { data: membersResponse } = useGetFactionMembersQuery({
		path: { game_id: gameId, faction_id: factionId },
	});

	if (!factionResponse || !membersResponse) {
		return <div>Loading...</div>;
	}

	const faction = factionResponse.data;
	const members = membersResponse.data?.members;

	if (!faction || !members) {
		return <div>Error loading faction or members</div>;
	}
	return <Example faction={faction} members={members} />;
}
