import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo } from "react";
import type { Character } from "~/api";
import {
	getFactionOptions,
	useGetCharacterLinksQuery,
	useListFactionsQuery,
} from "~/api/@tanstack/react-query.gen";
import { CreateCharacterLink } from "~/components/characters/create-character-link";
import { SelectFactionCombobox } from "~/components/characters/select-faction-combobox";
import { useAddTab } from "~/components/entity-tabs";
import { EntityView } from "~/components/entity-view";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { EntityLinksTable } from "~/components/ui/entity-links-table";
import { MinimalTiptap } from "~/components/ui/shadcn-io/minimal-tiptap";
import { useEditorContentActions } from "~/components/ui/shadcn-io/minimal-tiptap/hooks";
import { parseContentForEditor } from "~/components/ui/shadcn-io/minimal-tiptap/utils";
import {
	useGetCharacterSuspenseQuery,
	useUpdateCharacterMutation,
} from "~/queries/characters";
import { flattenLinksForTable, type GenericLinksResponse } from "~/utils/linkHelpers";

export const Route = createFileRoute("/_auth/games/$gameId/characters/$id/")({
	component: RouteComponent,
});

function RouteComponent() {
	const params = Route.useParams();
	const { gameId, id } = params;
	const { data } = useGetCharacterSuspenseQuery(gameId, id);
	const character = data?.data;

	useAddTab({
		data: character,
		entityType: "characters",
		gameId,
	});

	if (!character) {
		return <Navigate to=".." />;
	}

	return <CharacterView character={character} gameId={gameId} />;
}

// MAIN VIEW COMPONENT

interface CharacterViewProps {
	character: Character;
	gameId: string;
}
function CharacterView({ character, gameId }: CharacterViewProps) {
	const {
		data: linksResponse,
		isLoading: linksLoading,
		isError: linksError,
		error: linksQueryError,
	} = useGetCharacterLinksQuery({
		path: { game_id: gameId, character_id: character.id },
	});

	const { isUpdated, setIsUpdated, onChange, getPayload } = useEditorContentActions();

	const updateCharacter = useUpdateCharacterMutation(gameId, character.id);

	const handleSave = () => {
		updateCharacter.mutate({
			body: getPayload("character"),
			path: { game_id: gameId, id: character.id },
		});
		setIsUpdated(false);
	};

	const badges = (
		<div className="flex flex-wrap gap-2">
			<Badge>{character.class}</Badge>
			<Badge>Level: {character.level}</Badge>
			{character.tags && character.tags.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{character.tags.map((tag) => (
						<Badge key={tag} variant="secondary">
							{tag}
						</Badge>
					))}
				</div>
			)}
		</div>
	);

	const contentTab = (
		<div className="space-y-4">
			<MinimalTiptap
				content={parseContentForEditor(character.content)}
				onChange={onChange}
			/>
			<Button variant={"secondary"} onClick={handleSave} disabled={!isUpdated}>
				Save
			</Button>
		</div>
	);

	const linksTab = (
		<div className="space-y-4">
			<CreateCharacterLink gameId={gameId} characterId={character.id} />
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
					sourceType="character"
					sourceId={character.id}
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
			id: "faction",
			label: "Faction",
			content: <CharacterFactionView gameId={gameId} characterId={character.id} />,
		},
	];

	return (
		<>
			<div>{character.member_of_faction_id || "no faction"}</div>
			<EntityView name={character.name} badges={badges} tabs={tabs} />
		</>
	);
}

interface CharacterFactionViewProps {
	gameId: string;
	characterId: string;
	primaryFactionId?: string;
}
function CharacterFactionView({
	gameId,
	characterId,
	primaryFactionId,
}: CharacterFactionViewProps) {
	// Fetch the primary faction if it exists
	const { data: factionData, isEnabled } = useQuery({
		...getFactionOptions({ path: { game_id: gameId, id: primaryFactionId! } }),
		enabled: !!primaryFactionId,
	});

	const faction = factionData?.data;

	// Fetch faction list for switcher
	const { data: factionList, isLoading: isFactionListLoading } = useListFactionsQuery({
		path: { game_id: gameId },
	});

	const factions = useMemo(() => factionList?.data ?? [], [factionList?.data]);

	if (!isEnabled) {
		return (
			<div>
				<h2>Faction View</h2>
				{isFactionListLoading ? (
					<div>Loading factions...</div>
				) : (
					<SelectFactionCombobox
						gameId={gameId}
						characterId={characterId}
						factions={factions}
					/>
				)}
			</div>
		);
	}

	return (
		<div>
			<h2>Faction View</h2>
			{faction && (
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<div className="text-muted-foreground">Primary Faction</div>
						<div className="text-muted-foreground">{faction.name}</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="text-muted-foreground">Secondary Faction</div>
						<div className="text-muted-foreground">{faction.name}</div>
					</div>
				</div>
			)}
		</div>
	);
}
