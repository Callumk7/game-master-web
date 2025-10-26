import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";
import type { Quest } from "~/api";
import {
	listPinnedEntitiesQueryKey,
	useGetQuestLinksQuery,
} from "~/api/@tanstack/react-query.gen";
import { EntityLinksTable } from "~/components/links/entity-links-table";
import { createBaseLinkTableColumns } from "~/components/links/link-table-columns";
import type { GenericLinksResponse } from "~/components/links/types";
import { flattenLinksForTable } from "~/components/links/utils";
import { ObjectivesView } from "~/components/quests/objectives-view";
import { QuestLinksPopover } from "~/components/quests/quest-links-popover";
import { QuestNoteView } from "~/components/quests/quest-note-view";
import { EntityEditor } from "~/components/ui/editor/entity-editor";
import { useDeleteQuestMutation, useUpdateQuestMutation } from "~/queries/quests";
import { useHandleEditQuest } from "~/state/ui";
import { capitalise } from "~/utils/capitalise";
import { createBadges } from "../utils";
import { EntityView } from "../views/entity-view";
import { SubQuestView } from "./sub-quest-view";

interface QuestViewProps {
	quest: Quest;
	gameId: string;
}

export function QuestView({ quest, gameId }: QuestViewProps) {
	const navigate = useNavigate({ from: "/games/$gameId/quests/$id" });
	const queryClient = useQueryClient();

	const updateQuest = useUpdateQuestMutation(gameId, quest.id);
	const handleTogglePin = async () => {
		updateQuest.mutateAsync(
			{
				body: { quest: { pinned: !quest.pinned } },
				path: { game_id: gameId, id: quest.id },
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: listPinnedEntitiesQueryKey({
							path: { game_id: gameId },
						}),
					});
				},
			},
		);
	};

	const deleteQuest = useDeleteQuestMutation(gameId, quest.id);
	const handleDelete = () => {
		deleteQuest.mutate({
			path: { game_id: gameId, id: quest.id },
		});
		toast.warning("Quest deleted successfully!");
		navigate({ to: ".." });
	};

	const handleEdit = useHandleEditQuest(quest.id);

	const tabs = [
		{
			id: "content",
			label: "Content",
			content: <ContentTab quest={quest} gameId={gameId} />,
		},
		{
			id: "links",
			label: "Links",
			content: <LinksTab quest={quest} gameId={gameId} />,
		},
		{
			id: "quests",
			label: "Sub Quests",
			content: <SubQuestView gameId={gameId} questId={quest.id} />,
		},
		{
			id: "notes",
			label: "Notes",
			content: <QuestNoteView gameId={gameId} questId={quest.id} />,
		},
		{
			id: "objectives",
			label: "Objectives",
			content: <ObjectivesView gameId={gameId} questId={quest.id} />,
		},
	];

	const badges = createBadges(capitalise(quest.status), quest.tags);

	return (
		<EntityView
			id={quest.id}
			gameId={gameId}
			type="quest"
			content={quest.content}
			content_plain_text={quest.content_plain_text}
			name={quest.name}
			badges={badges}
			tabs={tabs}
			pinned={quest.pinned}
			onEdit={handleEdit}
			onDelete={handleDelete}
			onTogglePin={handleTogglePin}
		/>
	);
}

// =============================================================================
// CONTENT TAB COMPONENT
// =============================================================================
interface ContentTabProps {
	quest: Quest;
	gameId: string;
}
function ContentTab({ quest, gameId }: ContentTabProps) {
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
	return (
		<EntityEditor
			content={quest.content}
			gameId={gameId}
			entityType="quest"
			entityId={quest.id}
			onSave={handleSave}
		/>
	);
}

// =============================================================================
// LINKS TAB COMPONENT
// =============================================================================
interface LinksTabProps {
	quest: Quest;
	gameId: string;
}
function LinksTab({ quest, gameId }: LinksTabProps) {
	const {
		data: linksResponse,
		isLoading: linksLoading,
		isError: linksError,
		error: linksQueryError,
	} = useGetQuestLinksQuery({
		path: { game_id: gameId, quest_id: quest.id },
	});
	const columns = React.useMemo(
		() => createBaseLinkTableColumns(gameId, quest.id, "quest"),
		[gameId, quest.id],
	);
	return (
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
					columns={columns}
				/>
			)}
		</div>
	);
}
