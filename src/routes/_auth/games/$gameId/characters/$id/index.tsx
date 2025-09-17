import { createFileRoute } from "@tanstack/react-router";
import { getCharacterOptions } from "~/api/@tanstack/react-query.gen";
import { CharacterDetail } from "~/components/characters/CharacterDetail";
import { useCharacterQuery } from "~/queries/characters";

export const Route = createFileRoute("/_auth/games/$gameId/characters/$id/")({
	component: RouteComponent,
	loader: ({ context, params }) => {
		context.queryClient.ensureQueryData(
			getCharacterOptions({
				path: { game_id: params.gameId, id: params.id },
			}),
		);
	},
});

function RouteComponent() {
	const { gameId, id } = Route.useParams();
	const { data } = useCharacterQuery(gameId, id);

	if (!data?.data) {
		return <div>Character not found</div>;
	}

	return <CharacterDetail character={data.data} gameId={gameId} />;
}
