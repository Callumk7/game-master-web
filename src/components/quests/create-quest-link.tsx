import { CreateLinkForm } from "../links";

interface CreateQuestLinkProps {
	gameId: string;
	questId: string;
}

export function CreateQuestLink({ gameId, questId }: CreateQuestLinkProps) {
	return (
		<CreateLinkForm
			gameId={gameId}
			sourceEntityType="quest"
			sourceEntityId={questId}
		/>
	);
}
