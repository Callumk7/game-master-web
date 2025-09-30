import { createFileRoute } from "@tanstack/react-router";
import { getQuestOptions, useGetQuestQuery } from "~/api/@tanstack/react-query.gen";
import { EditQuestForm } from "~/components/quests/edit-quest-form";

export const Route = createFileRoute("/_auth/games/$gameId/quests/$id/edit")({
	component: RouteComponent,
	loader: ({ context, params }) => {
		context.queryClient.ensureQueryData(
			getQuestOptions({
				path: { game_id: params.gameId, id: params.id },
			}),
		);
	},
});

function RouteComponent() {
	const params = Route.useParams();
	const { gameId, id } = params;
	const { data, isLoading, isSuccess } = useGetQuestQuery({
		path: { game_id: gameId, id: id },
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			{isSuccess && <EditQuestForm initialData={data.data} params={params} />}
		</div>
	);
}
