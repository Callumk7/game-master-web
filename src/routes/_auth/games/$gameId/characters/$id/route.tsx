import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getCharacterOptions } from "~/api/@tanstack/react-query.gen";
import { CharacterLinksPopover } from "~/components/characters/character-links";
import { useCharacterQuery } from "~/queries/characters";

export const Route = createFileRoute("/_auth/games/$gameId/characters/$id")({
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

	return (
		<div>
			<CharacterLinksPopover gameId={gameId} characterId={data.data.id} />
			<Outlet />
		</div>
	);
}
