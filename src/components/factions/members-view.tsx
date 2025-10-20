import { useGetFactionMembersQuery } from "~/api/@tanstack/react-query.gen";
import { CharacterTable } from "~/components/characters/character-table";
import { Button } from "~/components/ui/button";
import { useUIActions } from "~/state/ui";

interface FactionMembersViewProps {
	factionId: string;
	gameId: string;
}
export function MembersView({ factionId, gameId }: FactionMembersViewProps) {
	const { data: memberData } = useGetFactionMembersQuery({
		path: { game_id: gameId, faction_id: factionId },
	});
	const members = memberData?.data?.members || [];
	const { setIsCreateCharacterOpen, setCreateCharacterFactionId } = useUIActions();

	setCreateCharacterFactionId(factionId);

	return (
		<div className="space-y-4">
			<Button onClick={() => setIsCreateCharacterOpen(true)}>
				Create Character
			</Button>
			<CharacterTable gameId={gameId} data={members} />
		</div>
	);
}
