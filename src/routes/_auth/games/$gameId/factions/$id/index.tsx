import { createFileRoute, Navigate } from "@tanstack/react-router";
import type { Faction } from "~/api";
import { useGetFactionLinksQuery } from "~/api/@tanstack/react-query.gen";
import { useAddTab } from "~/components/entity-tabs";
import { EntityView } from "~/components/entity-view";
import { CreateFactionLink } from "~/components/factions/create-faction-link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { EntityLinksTable } from "~/components/ui/entity-links-table";
import { MinimalTiptap } from "~/components/ui/shadcn-io/minimal-tiptap";
import { useEditorContentActions } from "~/components/ui/shadcn-io/minimal-tiptap/hooks";
import { parseContentForEditor } from "~/components/ui/shadcn-io/minimal-tiptap/utils";
import { useFactionSuspenseQuery, useUpdateFactionMutation } from "~/queries/factions";
import { flattenLinksForTable, type GenericLinksResponse } from "~/utils/linkHelpers";

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
		path: Route.fullPath,
		params,
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

	const { isUpdated, setIsUpdated, onChange, getPayload } = useEditorContentActions();
	const updateFaction = useUpdateFactionMutation(gameId, faction.id);

	const handleSave = () => {
		updateFaction.mutate({
			body: getPayload("faction"),
			path: { game_id: gameId, id: faction.id },
		});
		setIsUpdated(false);
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
		<div className="space-y-4">
			<MinimalTiptap
				content={parseContentForEditor(faction.content)}
				onChange={onChange}
			/>
			<Button variant={"secondary"} onClick={handleSave} disabled={!isUpdated}>
				Save
			</Button>
		</div>
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
			id: "members",
			label: "Members",
			content: <div>Members tabs tbc</div>,
		},
	];

	return <EntityView name={faction.name} badges={badges} tabs={tabs} />;
}
