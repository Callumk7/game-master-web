import { useGetQuestTreeQuery } from "~/api/@tanstack/react-query.gen";
import { Spinner } from "../ui/spinner";
import { QuestTreeView } from "./quest-tree-view";

interface SubQuestViewProps {
	gameId: string;
	questId: string;
}

export function SubQuestView({ gameId, questId }: SubQuestViewProps) {
	const { data: questTreeResponse, isLoading } = useGetQuestTreeQuery({
		path: { game_id: gameId },
		query: { start_id: questId },
	});

	if (isLoading) {
		return <Spinner />;
	}

	return <QuestTreeView gameId={gameId} questTreeResponse={questTreeResponse} />;
}
