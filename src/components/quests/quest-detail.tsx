import * as React from "react";
import { ScrollText } from "lucide-react";
import type { Quest } from "~/api/types.gen";
import { Button } from "~/components/ui/button";
import { DetailTemplate } from "~/components/ui/detail-template";
import { EntityLinksTable } from "~/components/ui/entity-links-table";
import { MinimalTiptap } from "~/components/ui/shadcn-io/minimal-tiptap";
import { useDeleteQuestMutation, useUpdateQuestMutation } from "~/queries/quests";
import { flattenLinksForTable, type GenericLinksResponse } from "~/utils/linkHelpers";
import { parseContentForEditor } from "~/utils/editorHelpers";
import { CreateQuestLink } from "./create-quest-link";
import { useGetQuestLinksQuery } from "~/api/@tanstack/react-query.gen";

interface QuestDetailProps {
	quest: Quest;
	gameId: string;
}

export function QuestDetail({ quest, gameId }: QuestDetailProps) {
	const {
		data: linksResponse,
		isLoading: linksLoading,
		isError: linksError,
		error: linksQueryError,
	} = useGetQuestLinksQuery({ path: { game_id: gameId, quest_id: quest.id } });

	const [isUpdated, setIsUpdated] = React.useState(false);
	const [updatedContent, setUpdatedContent] = React.useState<{
		json: object;
		text: string;
	}>({ json: {}, text: "" });
	const updateQuest = useUpdateQuestMutation(gameId, quest.id);

	const onChange = (newContent: { json: object; text: string }) => {
		setUpdatedContent(newContent);
		setIsUpdated(true);
	};

	const handleSave = () => {
		const payload = {
			quest: {
				content: JSON.stringify(updatedContent.json),
				content_plain_text: updatedContent.text,
			},
		};
		updateQuest.mutate({
			body: payload,
			path: { game_id: gameId, id: quest.id },
		});
		setIsUpdated(false);
	};

	const deleteQuest = useDeleteQuestMutation(gameId);

	const onDelete = () => {
		deleteQuest.mutate({
			path: { game_id: gameId, id: quest.id },
		});
	};

	const contentTab = (
		<div className="space-y-4">
			<MinimalTiptap
				content={parseContentForEditor(quest.content)}
				onChange={onChange}
			/>
			<Button variant={"secondary"} onClick={handleSave} disabled={!isUpdated}>
				Save
			</Button>
		</div>
	);

	const linksTab = (
		<div className="space-y-4">
			<CreateQuestLink gameId={gameId} questId={quest.id.toString()} />
			<h2 className="text-lg font-semibold">Links</h2>
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

	return (
		<DetailTemplate
			title={quest.name}
			icon={ScrollText}
			iconColor="text-purple-600"
			editPath="/games/$gameId/quests/$id/edit"
			gameId={gameId}
			entityId={quest.id.toString()}
			onDelete={onDelete}
			tabs={[
				{ id: "content", label: "Content", content: contentTab },
				{ id: "links", label: "Links", content: linksTab },
			]}
			defaultTab="content"
		/>
	);
}
