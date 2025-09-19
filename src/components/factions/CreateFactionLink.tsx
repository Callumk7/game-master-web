import { CreateLinkForm } from "../links";

interface CreateFactionLinkProps {
	gameId: string;
	factionId: string;
}

export function CreateFactionLink({ gameId, factionId }: CreateFactionLinkProps) {
	return (
		<CreateLinkForm
			gameId={gameId}
			sourceEntityType="faction"
			sourceEntityId={factionId}
		/>
	);
}
