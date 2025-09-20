import { createFileRoute, Outlet } from "@tanstack/react-router";
import * as React from "react";
import { listCharactersOptions } from "~/api/@tanstack/react-query.gen";
import { CreateCharacterSheet } from "~/components/characters/CreateCharacterSheet";
import { EntityHeader } from "~/components/EntityHeader";
import { useListCharactersQuery } from "~/queries/characters";

export const Route = createFileRoute("/_auth/games/$gameId/characters")({
	component: RouteComponent,
	loader: ({ params, context }) => {
		return context.queryClient.ensureQueryData(
			listCharactersOptions({ path: { game_id: params.gameId } }),
		);
	},
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	const { data } = useListCharactersQuery(gameId);
	const characters = data?.data || [];

	const [sheetOpen, setSheetOpen] = React.useState(false);

	const handleCreateNew = () => {
		setSheetOpen(true);
	};

	return (
		<div className="flex flex-col">
			<EntityHeader
				icon="👤"
				title="Characters"
				count={characters.length}
				entityType="character"
				onCreateNew={handleCreateNew}
			/>
			<CreateCharacterSheet isOpen={sheetOpen} setIsOpen={setSheetOpen} />
			<Outlet />
		</div>
	);
}
