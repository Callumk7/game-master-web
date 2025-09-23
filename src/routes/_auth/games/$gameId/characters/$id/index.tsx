import { createFileRoute } from "@tanstack/react-router";
import { CharacterDetail } from "~/components/characters/character-detail";
import { useAddTab } from "~/components/entity-tabs";
import { useCharacterQuery } from "~/queries/characters";

export const Route = createFileRoute("/_auth/games/$gameId/characters/$id/")({
	component: RouteComponent,
});

function RouteComponent() {
	const params = Route.useParams();
	const { gameId, id } = params;
	const { data } = useCharacterQuery(gameId, id);

	useAddTab({
		id,
		label: data?.data?.name ?? "Character",
		path: Route.fullPath,
		params,
	});

	if (!data?.data) {
		return <div>Character not found</div>;
	}

	return <CharacterDetail character={data.data} gameId={gameId} />;
}
