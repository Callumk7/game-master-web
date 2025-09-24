import { ClientOnly, createFileRoute, Navigate } from "@tanstack/react-router";
import type { Quest } from "~/api";
import { useGetQuestLinksQuery } from "~/api/@tanstack/react-query.gen";
import { useAddTab } from "~/components/entity-tabs";
import { EntityView } from "~/components/entity-view";
import { CreateQuestLink } from "~/components/quests/create-quest-link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { EntityLinksTable } from "~/components/ui/entity-links-table";
import { MinimalTiptap } from "~/components/ui/shadcn-io/minimal-tiptap";
import { useEditorContentActions } from "~/components/ui/shadcn-io/minimal-tiptap/hooks";
import { parseContentForEditor } from "~/components/ui/shadcn-io/minimal-tiptap/utils";
import { useGetQuestSuspenseQuery, useUpdateQuestMutation } from "~/queries/quests";
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

	const { isUpdated, setIsUpdated, onChange, getPayload } = useEditorContentActions();

	const updateQuest = useUpdateQuestMutation(gameId, quest.id);

	const handleSave = () => {
		updateQuest.mutate({
			body: getPayload("quest"),
			path: { game_id: gameId, id: quest.id },
		});
		setIsUpdated(false);
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
		<div className="space-y-4">
			<MinimalTiptap
				content={parseContentForEditor(quest.content)}
				onChange={onChange}
			/>
			<ClientOnly>
				<Button variant={"secondary"} onClick={handleSave} disabled={!isUpdated}>
					Save
				</Button>
			</ClientOnly>
		</div>
	);

	const linksTab = (
		<div className="space-y-4">
			<CreateQuestLink gameId={gameId} questId={quest.id} />
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
			content: <div>Objectives tabs tbc</div>,
		},
	];

	return <EntityView name={quest.name} badges={badges} tabs={tabs} />;
}
