import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";
import type { Faction } from "~/api";
import {
	listPinnedEntitiesQueryKey,
	useGetFactionLinksQuery,
} from "~/api/@tanstack/react-query.gen";
import { CreateFactionLink } from "~/components/factions/create-faction-link";
import { FactionImages } from "~/components/factions/faction-images";
import { FactionNoteView } from "~/components/factions/faction-note-view";
import { MembersView } from "~/components/factions/members-view";
import { EntityLinksTable } from "~/components/links/entity-links-table";
import { createBaseLinkTableColumns } from "~/components/links/link-table-columns";
import type { GenericLinksResponse } from "~/components/links/types";
import { flattenLinksForTable } from "~/components/links/utils";
import { EntityEditor } from "~/components/ui/editor/entity-editor";
import { EntityView } from "~/components/views/entity-view";
import { useDeleteFactionMutation, useUpdateFactionMutation } from "~/queries/factions";
import { createBadges } from "../utils";
import { FactionChart } from "./faction-chart";

interface FactionViewProps {
	faction: Faction;
	gameId: string;
}

export function FactionView({ faction, gameId }: FactionViewProps) {
	const queryClient = useQueryClient();
	const navigate = useNavigate({ from: "/games/$gameId/factions/$id" });

	const updateFaction = useUpdateFactionMutation(gameId, faction.id);
	const handleTogglePin = async () => {
		updateFaction.mutateAsync(
			{
				body: { faction: { pinned: !faction.pinned } },
				path: { game_id: gameId, id: faction.id },
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

	const deleteFaction = useDeleteFactionMutation(gameId, faction.id);
	const handleDelete = () => {
		deleteFaction.mutate({
			path: { game_id: gameId, id: faction.id },
		});
		toast.success("Faction deleted successfully!");
		navigate({ to: "." });
	};

	const tabs = [
		{
			id: "content",
			label: "Content",
			content: <ContentTab faction={faction} gameId={gameId} />,
		},
		{
			id: "links",
			label: "Links",
			content: <LinksTab faction={faction} gameId={gameId} />,
		},
		{
			id: "notes",
			label: "Notes",
			content: <FactionNoteView gameId={gameId} factionId={faction.id} />,
		},
		{
			id: "members",
			label: "Members",
			content: <MembersView factionId={faction.id} gameId={gameId} />,
		},
		{
			id: "images",
			label: "Images",
			content: <FactionImages gameId={gameId} factionId={faction.id} />,
		},
		{
			id: "chart",
			label: "Chart",
			content: <FactionChart gameId={gameId} factionId={faction.id} />,
		},
	];

	const badges = createBadges(faction.tags);

	return (
		<EntityView
			id={faction.id}
			gameId={gameId}
			type="faction"
			content={faction.content}
			content_plain_text={faction.content_plain_text}
			name={faction.name}
			badges={badges}
			tabs={tabs}
			pinned={faction.pinned}
			onEdit={() => navigate({ to: "edit" })}
			onDelete={handleDelete}
			onTogglePin={handleTogglePin}
		/>
	);
}

// =============================================================================
// CONTENT TAB COMPONENT
// =============================================================================
interface ContentTabProps {
	faction: Faction;
	gameId: string;
}
function ContentTab({ faction, gameId }: ContentTabProps) {
	const updateFaction = useUpdateFactionMutation(gameId, faction.id);

	const handleSave = async (payload: {
		content: string;
		content_plain_text: string;
	}) => {
		updateFaction.mutate({
			body: { faction: payload },
			path: { game_id: gameId, id: faction.id },
		});
	};

	return (
		<EntityEditor
			content={faction.content}
			gameId={gameId}
			entityType="faction"
			entityId={faction.id}
			onSave={handleSave}
		/>
	);
}

// =============================================================================
// LINKS TAB COMPONENT
// =============================================================================
interface LinksTabProps {
	faction: Faction;
	gameId: string;
}
function LinksTab({ faction, gameId }: LinksTabProps) {
	const {
		data: linksResponse,
		isLoading: linksLoading,
		isError: linksError,
		error: linksQueryError,
	} = useGetFactionLinksQuery({ path: { game_id: gameId, faction_id: faction.id } });

	const columns = React.useMemo(
		() => createBaseLinkTableColumns(gameId, faction.id, "faction"),
		[gameId, faction.id],
	);

	return (
		<div className="space-y-4">
			<CreateFactionLink gameId={gameId} factionId={faction.id} />
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
