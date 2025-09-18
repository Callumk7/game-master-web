import { createFileRoute, Outlet } from "@tanstack/react-router";
import * as React from "react";
import { listFactionsOptions } from "~/api/@tanstack/react-query.gen";
import { EntityHeader } from "~/components/EntityHeader";
import { CreateFactionSheet } from "~/components/factions/CreateFactionSheet";
import { useListFactionsQuery } from "~/queries/factions";

export const Route = createFileRoute("/_auth/games/$gameId/factions")({
	component: RouteComponent,
	loader: ({ context, params }) => {
		return context.queryClient.ensureQueryData(
			listFactionsOptions({ path: { game_id: params.gameId } }),
		);
	},
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	const { data } = useListFactionsQuery(gameId);
	const factions = data.data || [];

	const [sheetOpen, setSheetOpen] = React.useState(false);

	const handleCreateNew = () => {
		setSheetOpen(true);
	};

	return (
		<div className="flex flex-col">
			<EntityHeader
				icon="⚔"
				title="Factions"
				count={factions.length}
				entityType="faction"
				onCreateNew={handleCreateNew}
			/>
			<Outlet />
			<CreateFactionSheet isOpen={sheetOpen} setIsOpen={setSheetOpen} />
		</div>
	);
}
