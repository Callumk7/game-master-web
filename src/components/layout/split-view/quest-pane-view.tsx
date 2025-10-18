import { useQuery } from "@tanstack/react-query";
import { getQuestOptions } from "~/api/@tanstack/react-query.gen";
import type { Quest } from "~/api/types.gen";
import { useUpdateQuestMutation } from "~/queries/quests";
import type { EntityMutationPayload } from "~/types/split-view";
import { EntityContentRenderer } from "./entity-content-renderer";
import { useEntityNavigation } from "./hooks";

interface QuestPaneViewProps {
	gameId: string;
	questId: string;
	onClearEntity: () => void;
	onAddEntity: () => void;
}

export function QuestPaneView({
	gameId,
	questId,
	onClearEntity,
	onAddEntity,
}: QuestPaneViewProps) {
	const {
		data: questResponse,
		isLoading,
		isError,
	} = useQuery(
		getQuestOptions({
			path: { game_id: gameId, id: questId },
		}),
	);

	const { mutateAsync } = useUpdateQuestMutation(gameId, questId);
	const { openFullView, refreshEntity } = useEntityNavigation({ gameId });

	const handleSave = async (payload: EntityMutationPayload) => {
		await mutateAsync({
			body: { quest: payload },
			path: { game_id: gameId, id: questId },
		});
	};

	const handleRefresh = () => {
		refreshEntity("quest", questId);
	};

	const handleOpenFullView = () => {
		openFullView("quest", questId);
	};

	// Transform API quest to match our component's expected format
	const quest: Quest | undefined = questResponse?.data;

	return (
		<EntityContentRenderer
			entity={quest}
			entityType="quest"
			gameId={gameId}
			onSave={handleSave}
			isLoading={isLoading}
			isError={isError}
			onClearEntity={onClearEntity}
			onAddEntity={onAddEntity}
			onRefresh={handleRefresh}
			onOpenFullView={handleOpenFullView}
		/>
	);
}
