import { createFileRoute, Outlet } from "@tanstack/react-router";
import * as React from "react";
import { EntityHeader } from "~/components/EntityHeader";
import { CreateNoteSheet } from "~/components/notes/create-note-sheet";

export const Route = createFileRoute("/_auth/games/$gameId/notes")({
	component: RouteComponent,
});

function RouteComponent() {
	const [sheetOpen, setSheetOpen] = React.useState(false);

	const handleCreateNew = () => {
		setSheetOpen(true);
	};

	return (
		<div className="flex flex-col">
			<EntityHeader entityType="note" onCreateNew={handleCreateNew} />
			<Outlet />
			<CreateNoteSheet isOpen={sheetOpen} setIsOpen={setSheetOpen} />
		</div>
	);
}
