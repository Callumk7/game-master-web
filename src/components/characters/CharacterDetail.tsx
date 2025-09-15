import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { User } from "lucide-react";
import {
	deleteCharacterMutation,
	getCharacterLinksOptions,
	listCharactersQueryKey,
} from "~/api/@tanstack/react-query.gen";
import type { Character } from "~/api/types.gen";
import { Badge } from "~/components/ui/badge";
import { DetailTemplate } from "~/components/ui/DetailTemplate";
import { EntityLinksTable } from "~/components/ui/EntityLinksTable";
import { flattenLinksForTable, type GenericLinksResponse } from "~/utils/linkHelpers";
import { CreateCharacterLink } from "./CreateCharacterLink";

interface CharacterDetailProps {
	character: Character;
	gameId: string;
}

export function CharacterDetail({ character, gameId }: CharacterDetailProps) {
	const formatDate = (dateString?: string) => {
		if (!dateString) return "Unknown";
		return new Date(dateString).toLocaleDateString();
	};

	const context = useRouteContext({ from: "/_auth/games/$gameId/characters/$id" });

	const {
		data: linksResponse,
		isLoading: linksLoading,
		isError: linksError,
		error: linksQueryError,
	} = useGetCharacterLinks(gameId, character.id.toString());

	const badges = (
		<div className="flex gap-2">
			<Badge variant="secondary">{character.class}</Badge>
			<Badge variant="outline">Level {character.level}</Badge>
		</div>
	);

	const fields = [
		{ label: "Name", value: character.name },
		{ label: "Class", value: character.class },
		{ label: "Level", value: character.level },
		{ label: "ID", value: <span className="font-mono">#{character.id}</span> },
		{ label: "Created", value: formatDate(character.created_at) },
		{ label: "Last Updated", value: formatDate(character.updated_at) },
	];

	const navigate = useNavigate();

	const deleteCharacter = useMutation({
		...deleteCharacterMutation(),
		onSuccess: () => {
			context.queryClient.invalidateQueries({
				queryKey: listCharactersQueryKey({
					path: { game_id: gameId },
				}),
			});
			navigate({ to: ".." });
		},
	});

	const onDelete = () => {
		deleteCharacter.mutate({
			path: { game_id: gameId, id: character.id.toString() },
		});
	};

	return (
		<div className="space-y-6">
			<DetailTemplate
				title={character.name}
				icon={User}
				iconColor="text-green-600"
				badges={badges}
				editPath="/games/$gameId/characters/$id/edit"
				gameId={gameId}
				entityId={character.id.toString()}
				imageUrl={character.image_url}
				imageAlt={`${character.name}'s portrait`}
				fields={fields}
				onDelete={onDelete}
				content={
					character.description
						? {
								title: "Description",
								value: character.description,
							}
						: undefined
				}
			/>
			<div className="space-y-4">
				<h2 className="text-lg font-semibold">Links</h2>
				<CreateCharacterLink
					gameId={gameId}
					characterId={character.id}
				/>
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
		</div>
	);
}

export const useGetCharacterLinks = (gameId: string, characterId: string) => {
	return useQuery(
		getCharacterLinksOptions({
			path: { game_id: gameId, character_id: characterId },
		}),
	);
};
