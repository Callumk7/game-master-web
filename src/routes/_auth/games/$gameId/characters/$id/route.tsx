import { createFileRoute, Outlet } from "@tanstack/react-router";
import * as React from "react";
import {
	getCharacterNotesTreeOptions,
	getCharacterOptions,
} from "~/api/@tanstack/react-query.gen";
import { EditCharacterDetailsDialog } from "~/components/characters/edit-details-dialog";
import { EntityViewHeader } from "~/components/entity-view";
import { useCharacterQuery } from "~/queries/characters";

export const Route = createFileRoute("/_auth/games/$gameId/characters/$id")({
	component: RouteComponent,
	loader: ({ context, params }) => {
		context.queryClient.ensureQueryData(
			getCharacterOptions({
				path: { game_id: params.gameId, id: params.id },
			}),
		);
		context.queryClient.ensureQueryData(
			getCharacterNotesTreeOptions({
				path: { game_id: params.gameId, id: params.id },
			}),
		);
	},
});

function RouteComponent() {
	const { gameId, id } = Route.useParams();
	const { data, status, error } = useCharacterQuery(gameId, id);
	const [editDetailsOpen, setEditDetailsOpen] = React.useState(false);

	if (error) {
		return (
			<div>
				Error: <pre>{JSON.stringify(error, null, 2)}</pre>
			</div>
		);
	}
	return (
		<div>
			<Outlet />
			<EditCharacterDetailsDialog
				gameId={gameId}
				characterId={id}
				open={editDetailsOpen}
				setOpen={setEditDetailsOpen}
			/>
		</div>
	);
}
