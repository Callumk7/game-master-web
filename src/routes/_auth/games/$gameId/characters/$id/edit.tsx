import { createFileRoute } from "@tanstack/react-router";
import {
	getCharacterOptions,
	useGetCharacterQuery,
} from "~/api/@tanstack/react-query.gen";
import { EditCharacterForm } from "~/components/characters/edit-character-form";

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
	const params = Route.useParams();
	const { gameId, id } = params;
	const { data, isLoading, isSuccess } = useGetCharacterQuery({
		path: { game_id: gameId, id: id },
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			{isSuccess && <EditCharacterForm initialData={data.data} params={params} />}
		</div>
	);
}
