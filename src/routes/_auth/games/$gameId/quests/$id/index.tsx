import { createFileRoute, Navigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { Quest } from "~/api";
import { useGetQuestLinksQuery } from "~/api/@tanstack/react-query.gen";
import { useAddTab } from "~/components/entity-tabs";
import { EntityView } from "~/components/entity-view";
import { ObjectivesView } from "~/components/quests/objectives-view";
import { QuestLinksPopover } from "~/components/quests/quest-links-popover";
import { Badge } from "~/components/ui/badge";
import { EntityEditor } from "~/components/ui/editor/entity-editor";
import { EntityLinksTable } from "~/components/ui/entity-links-table";
import {
	useDeleteQuestMutation,
	useGetQuestSuspenseQuery,
	useUpdateQuestMutation,
} from "~/queries/quests";
import { flattenLinksForTable, type GenericLinksResponse } from "~/utils/linkHelpers";

export const Route = createFileRoute("/_auth/games/$gameId/quests/$id/")({
	component: RouteComponent,
});

function RouteComponent() {
	const params = Route.useParams();
	const { gameId, id } = params;
	const { data } = useGetQuestSuspenseQuery(gameId, id);
	const quest = data?.data;

	useAddTab({
		data: quest,
		entityType: "quests",
		gameId,
	});

	if (!quest) {
		return <Navigate to=".." />;
	}

	return <QuestView quest={quest} gameId={gameId} />;
}

// MAIN VIEW COMPONENT

interface QuestViewProps {
	quest: Quest;
	gameId: string;
}

function QuestView({ quest, gameId }: QuestViewProps) {
	const {
		data: linksResponse,
		isLoading: linksLoading,
		isError: linksError,
		error: linksQueryError,
	} = useGetQuestLinksQuery({
		path: { game_id: gameId, quest_id: quest.id },
	});

	const navigate = Route.useNavigate();

	const updateQuest = useUpdateQuestMutation(gameId, quest.id);

	const handleSave = async (payload: {
		content: string;
		content_plain_text: string;
	}) => {
		updateQuest.mutate({
			body: { quest: payload },
			path: { game_id: gameId, id: quest.id },
		});
	};

	const deleteQuest = useDeleteQuestMutation(gameId);
	const handleDelete = () => {
		deleteQuest.mutate({
			path: { game_id: gameId, id: quest.id },
		});
		toast("Quest deleted successfully!");
		navigate({ to: "." });
	};

	const badges = quest.tags && quest.tags.length > 0 && (
		<div className="flex flex-wrap gap-2">
			{quest.tags.map((tag) => (
				<Badge key={tag} variant="secondary">
					{tag}
				</Badge>
			))}
		</div>
	);

	const contentTab = (
		<EntityEditor
			content={quest.content}
			gameId={gameId}
			entityType="quest"
			entityId={quest.id}
			onSave={handleSave}
			isSaving={updateQuest.isPending}
		/>
	);

	const linksTab = (
		<div className="space-y-4">
			<QuestLinksPopover gameId={gameId} questId={quest.id} />
			{linksLoading && (
				<div className="text-muted-foreground">Loading links...</div>
			)}
			{linksError && (
				<div className="text-destructive">
					Error loading links: {linksQueryError?.message}
				</div>
			)}
			{!linksLoading && !linksError && linksResponse && (
				<EntityLinksTable
					links={flattenLinksForTable(linksResponse as GenericLinksResponse)}
					gameId={gameId}
					sourceId={quest.id}
					sourceType="quest"
				/>
			)}
		</div>
	);

	const tabs = [
		{
			id: "content",
			label: "Content",
			content: contentTab,
		},
		{
			id: "links",
			label: "Links",
			content: linksTab,
		},
		{
			id: "notes",
			label: "Notes",
			content: <div>Notes tabs tbc</div>,
		},
		{
			id: "objectives",
			label: "Objectives",
			content: <ObjectivesView gameId={gameId} questId={quest.id} />,
		},
	];

	return (
		<EntityView
			id={quest.id}
			type="quest"
			content={quest.content}
			content_plain_text={quest.content_plain_text}
			name={quest.name}
			badges={badges}
			tabs={tabs}
			onEdit={() => navigate({ to: "edit" })}
			onDelete={handleDelete}
		/>
	);
}
