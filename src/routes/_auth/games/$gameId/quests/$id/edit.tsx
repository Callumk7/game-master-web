import { createFileRoute } from "@tanstack/react-router";
import { getQuestOptions } from "~/api/@tanstack/react-query.gen";
import { EditQuestForm } from "~/components/quests/EditQuestForm";
import { useQuestQuery } from ".";

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
	const { gameId, id } = Route.useParams();
	const { data } = useQuestQuery(gameId, id);
	return (
		<div>
			<EditQuestForm initialData={data.data} />
		</div>
	);
}
