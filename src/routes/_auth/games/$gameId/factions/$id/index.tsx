import { createFileRoute, Navigate } from "@tanstack/react-router";
import * as React from "react";
import type { Faction } from "~/api";
import {
	useGetFactionLinksQuery,
	useGetFactionMembersQuery,
} from "~/api/@tanstack/react-query.gen";
import { CharacterTable } from "~/components/characters/character-table";
import { CreateCharacterSheet } from "~/components/characters/create-character-sheet";
import { useAddTab } from "~/components/entity-tabs";
import { EntityView } from "~/components/entity-view";
import { CreateFactionLink } from "~/components/factions/create-faction-link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { EntityEditor } from "~/components/ui/editor/entity-editor";
import { EntityLinksTable } from "~/components/ui/entity-links-table";
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
			isSaving={updateFaction.isPending}
		/>
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

	const navigate = Route.useNavigate();

	return (
		<EntityView
			name={faction.name}
			badges={badges}
			tabs={tabs}
			onEdit={() => navigate({ to: "edit" })}
		/>
	);
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
	const [isOpen, setIsOpen] = React.useState(false);

	return (
		<div className="space-y-4">
			<Button onClick={() => setIsOpen(true)}>Create Character</Button>
			<CharacterTable
				gameId={gameId}
				data={members}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				tagFilter={tagFilter}
				onTagFilterChange={setTagFilter}
			/>
			<CreateCharacterSheet
				isOpen={isOpen}
				setIsOpen={setIsOpen}
				factionId={factionId}
			/>
		</div>
	);
}
