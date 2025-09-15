import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { listFactionsOptions } from "~/api/@tanstack/react-query.gen";
import { EntityHeader } from "~/components/EntityHeader";
import { createColumns } from "~/components/factions/columns";
import { FactionsTable } from "~/components/factions/FactionsTable";

export const Route = createFileRoute("/_auth/games/$gameId/factions/")({
	component: RouteComponent,
	loader: ({ params, context }) => {
		context.queryClient.ensureQueryData(
			listFactionsOptions({ path: { game_id: params.gameId } }),
		);
	},
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	const { data } = useListFactionsQuery(gameId);
	const [searchQuery, setSearchQuery] = useState("");

	const factions = data.data || [];
	const columns = createColumns(gameId);

	const navigate = Route.useNavigate();

	const handleCreateNew = () => {
		navigate({ to: "new" });
	};

	return (
		<div className="space-y-4">
			<EntityHeader
				icon="⚔"
				title="Factions"
				count={factions.length}
				entityType="faction"
				onCreateNew={handleCreateNew}
			/>

			<FactionsTable
				columns={columns}
				data={factions}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
			/>
		</div>
	);
}

const useListFactionsQuery = (gameId: string) => {
	return useSuspenseQuery({ ...listFactionsOptions({ path: { game_id: gameId } }) });
};
