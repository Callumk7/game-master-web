import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";
import {
	deleteQuestMutation,
	getQuestLinksOptions,
	listQuestsQueryKey,
} from "~/api/@tanstack/react-query.gen";
import type { Quest } from "~/api/types.gen";
import { DetailTemplate } from "~/components/ui/DetailTemplate";
import { EntityLinksTable } from "~/components/ui/EntityLinksTable";
import { flattenLinksForTable, type GenericLinksResponse } from "~/utils/linkHelpers";
import { CreateQuestLink } from "./CreateQuestLink";

interface QuestDetailProps {
	quest: Quest;
	gameId: string;
}

export function QuestDetail({ quest, gameId }: QuestDetailProps) {
	const formatDate = (dateString?: string) => {
		if (!dateString) return "Unknown";
		return new Date(dateString).toLocaleDateString();
	};

	const context = useRouteContext({ from: "/_auth/games/$gameId/quests/$id" });

	const {
		data: linksResponse,
		isLoading: linksLoading,
		isError: linksError,
		error: linksQueryError,
	} = useQuery(
		getQuestLinksOptions({
			path: { game_id: gameId, quest_id: quest.id },
		}),
	);

	const fields = [
		{ label: "Name", value: quest.name },
		{ label: "ID", value: <span className="font-mono">#{quest.id}</span> },
		{ label: "Created", value: formatDate(quest.created_at) },
		{ label: "Last Updated", value: formatDate(quest.updated_at) },
	];

	const navigate = useNavigate();

	const deleteQuest = useMutation({
		...deleteQuestMutation(),
		onSuccess: () => {
			context.queryClient.invalidateQueries({
				queryKey: listQuestsQueryKey({
					path: { game_id: gameId },
				}),
			});
			navigate({ to: ".." });
		},
	});

	const onDelete = () => {
		deleteQuest.mutate({
			path: { game_id: gameId, id: quest.id },
		});
	};

	return (
		<div className="space-y-6">
			<DetailTemplate
				title={quest.name}
				icon={ScrollText}
				iconColor="text-purple-600"
				editPath="/games/$gameId/quests/$id/edit"
				gameId={gameId}
				entityId={quest.id.toString()}
				fields={fields}
				onDelete={onDelete}
				content={
					quest.content
						? {
								title: "Content",
								value: quest.content,
							}
						: undefined
				}
			/>
			<CreateQuestLink gameId={gameId} questId={quest.id.toString()} />
			<div className="space-y-4">
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
						links={flattenLinksForTable(
							linksResponse as GenericLinksResponse,
						)}
						gameId={gameId}
					/>
				)}
			</div>
		</div>
	);
}
