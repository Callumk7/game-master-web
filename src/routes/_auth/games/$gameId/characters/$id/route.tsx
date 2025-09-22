import { createFileRoute, Outlet } from "@tanstack/react-router";
import * as React from "react";
import { CharacterMenu } from "~/components/characters/character-menu";
import { EditCharacterDetailsDialog } from "~/components/characters/edit-details-dialog";

export const Route = createFileRoute("/_auth/games/$gameId/characters/$id")({
	component: RouteComponent,
});

function RouteComponent() {
	const { gameId, id } = Route.useParams();
	const [editDetailsOpen, setEditDetailsOpen] = React.useState(false);
	return (
		<div>
			<CharacterMenu
				onEditDetails={() => setEditDetailsOpen(true)}
				onDelete={() => {}}
			/>
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
