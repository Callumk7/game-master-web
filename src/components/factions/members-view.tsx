import * as React from "react";
import { useGetFactionMembersQuery } from "~/api/@tanstack/react-query.gen";
import { CharacterTable } from "~/components/characters/character-table";
import { CreateCharacterSheet } from "~/components/characters/create-character-sheet";
import { Button } from "~/components/ui/button";

interface FactionMembersViewProps {
	factionId: string;
	gameId: string;
}
export function MembersView({ factionId, gameId }: FactionMembersViewProps) {
	const { data: memberData } = useGetFactionMembersQuery({
		path: { game_id: gameId, faction_id: factionId },
	});
	const members = memberData?.data?.members || [];
	const [isOpen, setIsOpen] = React.useState(false);

	return (
		<div className="space-y-4">
			<Button onClick={() => setIsOpen(true)}>Create Character</Button>
			<CharacterTable gameId={gameId} data={members} />
			<CreateCharacterSheet
				isOpen={isOpen}
				setIsOpen={setIsOpen}
				factionId={factionId}
			/>
		</div>
	);
}
