import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getNoteOptions } from "~/api/@tanstack/react-query.gen";
import { useAddTab } from "~/components/entity-tabs";
import { NoteDetail } from "~/components/notes/NoteDetail";

export const Route = createFileRoute("/_auth/games/$gameId/notes/$id/")({
	component: RouteComponent,
	loader: ({ context, params }) => {
		context.queryClient.ensureQueryData(
			getNoteOptions({
				path: {
					game_id: params.gameId,
					id: params.id,
				},
			}),
		);
	},
});

function RouteComponent() {
	const params = Route.useParams();
	const { gameId, id } = params;
	const { data } = useNoteQuery(gameId, id);

	useAddTab({
		id,
		label: data?.data?.name ?? "Note",
		path: Route.fullPath,
		params,
	});

	if (!data?.data) {
		return <div>Note not found</div>;
	}

	return (
		<div>
			<NoteDetail note={data.data} gameId={gameId} />
		</div>
	);
}

export const useNoteQuery = (gameId: string, id: string) => {
	return useSuspenseQuery({
		...getNoteOptions({
			path: { game_id: gameId, id },
		}),
	});
};
