import { createFileRoute } from "@tanstack/react-router";
import { getCharacterOptions } from "~/api/@tanstack/react-query.gen";
import { EditCharacterForm } from "~/components/characters/EditCharacterForm";
import { useCharacterQuery } from "~/queries/characters";

export const Route = createFileRoute("/_auth/games/$gameId/characters/$id/edit")({
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
	return (
		<div>
			<EditCharacterForm initialData={data.data} />
		</div>
	);
}
