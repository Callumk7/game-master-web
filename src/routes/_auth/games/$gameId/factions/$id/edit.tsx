import { createFileRoute } from "@tanstack/react-router";
import { getFactionOptions, useGetFactionQuery } from "~/api/@tanstack/react-query.gen";
import { EditFactionForm } from "~/components/factions/edit-faction-form";

export const Route = createFileRoute("/_auth/games/$gameId/factions/$id/edit")({
	component: RouteComponent,
	loader: ({ context, params }) => {
		context.queryClient.ensureQueryData(
			getFactionOptions({
				path: { game_id: params.gameId, id: params.id },
			}),
		);
	},
});

function RouteComponent() {
	const { gameId, id } = Route.useParams();
	const { data, isLoading, isSuccess } = useGetFactionQuery({
		path: { game_id: gameId, id: id },
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return <div>{isSuccess && <EditFactionForm initialData={data.data} />}</div>;
}
