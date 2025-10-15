import { createFileRoute, Navigate } from "@tanstack/react-router";
import * as React from "react";
import { toast } from "sonner";
import type { Faction } from "~/api";
import {
	listPinnedEntitiesQueryKey,
	useGetFactionLinksQuery,
} from "~/api/@tanstack/react-query.gen";
import { useAddTab } from "~/components/entity-tabs";
import { EntityView } from "~/components/entity-view";
import { CreateFactionLink } from "~/components/factions/create-faction-link";
import { FactionImages } from "~/components/factions/faction-images";
import { FactionNoteView } from "~/components/factions/faction-note-view";
import { MembersView } from "~/components/factions/members-view";
import { EntityLinksTable } from "~/components/links/entity-links-table";
import { createBaseLinkTableColumns } from "~/components/links/link-table-columns";
import type { GenericLinksResponse } from "~/components/links/types";
import { flattenLinksForTable } from "~/components/links/utils";
import { Badge } from "~/components/ui/badge";
import { EntityEditor } from "~/components/ui/editor/entity-editor";
import {
	useDeleteFactionMutation,
	useFactionSuspenseQuery,
	useUpdateFactionMutation,
} from "~/queries/factions";

export const Route = createFileRoute("/_auth/games/$gameId/factions/$id/")({
	component: RouteComponent,
});

function RouteComponent() {
	const params = Route.useParams();
	const { gameId, id } = params;
	const { data } = useFactionSuspenseQuery(gameId, id);
	const faction = data?.data;

	useAddTab({
		data: faction,
		entityType: "factions",
		gameId,
	});

	if (!faction) {
		return <Navigate to=".." />;
	}

	return <FactionView faction={faction} gameId={gameId} />;
}

// MAIN VIEW COMPONENT

interface FactionViewProps {
	faction: Faction;
	gameId: string;
}

function FactionView({ faction, gameId }: FactionViewProps) {
	const {
		data: linksResponse,
		isLoading: linksLoading,
		isError: linksError,
		error: linksQueryError,
	} = useGetFactionLinksQuery({ path: { game_id: gameId, faction_id: faction.id } });

	const context = Route.useRouteContext();
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

	const deleteFaction = useDeleteFactionMutation(gameId, faction.id);

	const handleDelete = () => {
		deleteFaction.mutate({
			path: { game_id: gameId, id: faction.id },
		});
		toast("Faction deleted successfully!");
		navigate({ to: "." });
	};

	const handleTogglePin = async () => {
		updateFaction.mutateAsync(
			{
				body: { faction: { pinned: !faction.pinned } },
				path: { game_id: gameId, id: faction.id },
			},
			{
				onSuccess: () => {
					context.queryClient.invalidateQueries({
						queryKey: listPinnedEntitiesQueryKey({
							path: { game_id: gameId },
						}),
					});
				},
			},
		);
	};

	const badges = faction.tags && faction.tags.length > 0 && (
		<div className="flex flex-wrap gap-2">
			{faction.tags.map((tag) => (
				<Badge key={tag} variant="secondary">
					{tag}
				</Badge>
			))}
		</div>
	);

	const contentTab = (
		<EntityEditor
			content={faction.content}
			gameId={gameId}
			entityType="faction"
			entityId={faction.id}
			onSave={handleSave}
		/>
	);

	const columns = React.useMemo(
		() => createBaseLinkTableColumns(gameId, faction.id, "faction"),
		[gameId, faction.id],
	);

	const linksTab = (
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
	];

	const navigate = Route.useNavigate();

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
