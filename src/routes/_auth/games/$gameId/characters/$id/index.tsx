import { createFileRoute, Navigate } from "@tanstack/react-router";
import { CharacterView } from "~/components/characters/character-view";
import { useAddTab } from "~/components/entity-tabs";
import { useGetCharacterSuspenseQuery } from "~/queries/characters";

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
