import { createFileRoute, Outlet } from "@tanstack/react-router";
import * as React from "react";
import { EntityHeader } from "~/components/EntityHeader";
import { CreateFactionSheet } from "~/components/factions/CreateFactionSheet";

export const Route = createFileRoute("/_auth/games/$gameId/factions")({
	component: RouteComponent,
});

function RouteComponent() {
	const [sheetOpen, setSheetOpen] = React.useState(false);

	const handleCreateNew = () => {
		setSheetOpen(true);
	};

	return (
		<div className="flex flex-col">
			<EntityHeader entityType="faction" onCreateNew={handleCreateNew} />
			<Outlet />
			<CreateFactionSheet isOpen={sheetOpen} setIsOpen={setSheetOpen} />
		</div>
	);
}
