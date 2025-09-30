import { createFileRoute } from "@tanstack/react-router";
import { getNoteOptions, useGetNoteQuery } from "~/api/@tanstack/react-query.gen";
import { EditNoteForm } from "~/components/notes/edit-note-form";

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
	const params = Route.useParams();
	const { gameId, id } = params;
	const { data, isLoading, isSuccess } = useGetNoteQuery({
		path: { game_id: gameId, id: id },
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			{isSuccess && <EditNoteForm initialData={data.data} params={params} />}
		</div>
	);
}
