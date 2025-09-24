import { createFileRoute, Navigate } from "@tanstack/react-router";
import * as React from "react";
import type { Faction } from "~/api";
import {
	useGetFactionLinksQuery,
	useGetFactionMembersQuery,
} from "~/api/@tanstack/react-query.gen";
import { CharacterTable } from "~/components/characters/character-table";
import { createColumns } from "~/components/characters/columns";
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
					sourceId={faction.id}
					sourceType={"faction"}
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
			content: <MembersView factionId={faction.id} gameId={gameId} />,
		},
	];

	return <EntityView name={faction.name} badges={badges} tabs={tabs} />;
}

interface FactionMembersViewProps {
	factionId: string;
	gameId: string;
}
function MembersView({ factionId, gameId }: FactionMembersViewProps) {
	const { data: memberData } = useGetFactionMembersQuery({
		path: { game_id: gameId, faction_id: factionId },
	});
	const members = memberData?.data?.members || [];
	const [searchQuery, setSearchQuery] = React.useState("");
	const [tagFilter, setTagFilter] = React.useState("");

	const columns = createColumns(gameId);

	return (
		<CharacterTable
			columns={columns}
			data={members}
			searchQuery={searchQuery}
			onSearchChange={setSearchQuery}
			tagFilter={tagFilter}
			onTagFilterChange={setTagFilter}
		/>
	);
}
