import { createFileRoute, Outlet } from "@tanstack/react-router";
import * as React from "react";
import {
	getCharacterLinksOptions,
	getCharacterNotesTreeOptions,
	getCharacterOptions,
} from "~/api/@tanstack/react-query.gen";
import { EditCharacterDetailsDialog } from "~/components/characters/edit-details-dialog";
import { BasicErrorComponent } from "~/components/error";

export const Route = createFileRoute("/_auth/games/$gameId/characters/$id")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			getCharacterOptions({
				path: { game_id: params.gameId, id: params.id },
			}),
		);
		context.queryClient.ensureQueryData(
			getCharacterNotesTreeOptions({
				path: { game_id: params.gameId, id: params.id },
			}),
		);
		context.queryClient.ensureQueryData(
			getCharacterLinksOptions({
				path: { game_id: params.gameId, character_id: params.id },
			}),
		);
	},
	errorComponent: BasicErrorComponent,
});

function RouteComponent() {
	const { gameId, id } = Route.useParams();
	const [editDetailsOpen, setEditDetailsOpen] = React.useState(false);

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
