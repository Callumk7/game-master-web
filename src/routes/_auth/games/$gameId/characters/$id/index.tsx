import { createFileRoute, Navigate } from "@tanstack/react-router";
import type { Character } from "~/api";
import { useGetCharacterLinksQuery } from "~/api/@tanstack/react-query.gen";
import { CreateCharacterLink } from "~/components/characters/create-character-link";
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
		path: Route.fullPath,
		params,
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
			content: <div>Factions tabs tbc</div>,
		},
	];

	return <EntityView name={character.name} badges={badges} tabs={tabs} />;
}
