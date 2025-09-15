import { CreateLinkForm } from "../links";

interface CreateCharacterLinkProps {
	gameId: string;
	characterId: string;
}

export function CreateCharacterLink({ gameId, characterId }: CreateCharacterLinkProps) {
	return (
		<CreateLinkForm
			gameId={gameId}
			sourceEntityType="character"
			sourceEntityId={characterId}
			excludeTypes={["character"]} // Prevent character-to-character links if desired
		/>
	);
}
