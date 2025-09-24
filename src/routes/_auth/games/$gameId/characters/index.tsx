import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
	listCharactersOptions,
	useListCharactersQuery,
} from "~/api/@tanstack/react-query.gen";
import { CharacterTable } from "~/components/characters/character-table";
import { createColumns } from "~/components/characters/columns";
import { PageHeader } from "~/components/page-header";

export const Route = createFileRoute("/_auth/games/$gameId/characters/")({
	component: RouteComponent,
	loader: ({ params, context }) => {
		return context.queryClient.ensureQueryData(
			listCharactersOptions({ path: { game_id: params.gameId } }),
		);
	},
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	const { data, isLoading } = useListCharactersQuery({ path: { game_id: gameId } });
	const characters = data?.data || [];
	const [searchQuery, setSearchQuery] = useState("");
	const [tagFilter, setTagFilter] = useState("");

	if (isLoading) {
		return <div className="text-muted-foreground">Loading characters...</div>;
	}

	return (
		<div className="container mx-auto py-8">
			<PageHeader
				title="All Characters"
				description="Browse all characters in your game."
			/>
			<CharacterTable
				columns={createColumns(gameId)}
				data={characters}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				tagFilter={tagFilter}
				onTagFilterChange={setTagFilter}
			/>
		</div>
	);
}
