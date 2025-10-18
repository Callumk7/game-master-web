import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";
import { listCharactersOptions } from "~/api/@tanstack/react-query.gen";
import { CharacterTable } from "~/components/characters/character-table";
import { Container } from "~/components/container";
import { PageHeader } from "~/components/page-header";
import { useListCharactersSuspenseQuery } from "~/queries/characters";
import { useUIActions } from "~/state/ui";

export const Route = createFileRoute("/_auth/games/$gameId/characters/")({
	component: RouteComponent,
	loader: async ({ params, context }) => {
		await context.queryClient.ensureQueryData(
			listCharactersOptions({ path: { game_id: params.gameId } }),
		);
	},
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	const { data } = useListCharactersSuspenseQuery(gameId);
	const characters = data?.data || [];

	const { setIsCreateCharacterOpen } = useUIActions();

	const handleCreate = () => {
		setIsCreateCharacterOpen(true);
	};

	return (
		<Container>
			<PageHeader
				title="All Characters"
				description="Browse all characters in your game."
				Icon={User}
				handleCreate={handleCreate}
			/>
			<CharacterTable gameId={gameId} data={characters} />
		</Container>
	);
}
