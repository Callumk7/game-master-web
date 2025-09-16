import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { listCharactersOptions } from "~/api/@tanstack/react-query.gen";
import { CharacterTable } from "~/components/characters/CharacterTable";
import { createColumns } from "~/components/characters/columns";
import { useListCharactersQuery } from "~/queries/characters";

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
	const { data } = useListCharactersQuery(gameId);
	const characters = data.data || [];
	const [searchQuery, setSearchQuery] = useState("");
	const [tagFilter, setTagFilter] = useState("");

	return (
		<div className="space-y-4">
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
