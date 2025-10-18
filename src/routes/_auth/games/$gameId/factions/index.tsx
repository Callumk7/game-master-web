import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { listFactionsOptions } from "~/api/@tanstack/react-query.gen";
import { Container } from "~/components/container";
import { FactionsTable } from "~/components/factions/factions-table";
import { PageHeader } from "~/components/page-header";
import { useListFactionsSuspenseQuery } from "~/queries/factions";
import { useUIActions } from "~/state/ui";

export const Route = createFileRoute("/_auth/games/$gameId/factions/")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(
			listFactionsOptions({ path: { game_id: params.gameId } }),
		);
	},
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	const { data } = useListFactionsSuspenseQuery(gameId);

	const factions = data?.data || [];

	const { setIsCreateFactionOpen } = useUIActions();

	const handleCreate = () => {
		setIsCreateFactionOpen(true);
	};

	return (
		<Container>
			<PageHeader
				title="All Factions"
				description="Browse all factions in your game."
				Icon={Shield}
				handleCreate={handleCreate}
			/>
			<FactionsTable gameId={gameId} data={factions} />
		</Container>
	);
}
