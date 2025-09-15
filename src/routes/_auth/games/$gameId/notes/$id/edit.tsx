import { createFileRoute } from "@tanstack/react-router";
import { getNoteOptions } from "~/api/@tanstack/react-query.gen";
import { EditNoteForm } from "~/components/notes/EditNoteForm";
import { useNoteQuery } from ".";

export const Route = createFileRoute("/_auth/games/$gameId/notes/$id/edit")({
	component: RouteComponent,
	loader: ({ context, params }) => {
		context.queryClient.ensureQueryData(
			getNoteOptions({
				path: { game_id: params.gameId, id: params.id },
			}),
		);
	},
});

function RouteComponent() {
	const { gameId, id } = Route.useParams();
	const { data } = useNoteQuery(gameId, id);
	return (
		<div>
			<EditNoteForm initialData={data.data} />
		</div>
	);
}
