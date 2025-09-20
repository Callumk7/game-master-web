import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { listNotesOptions } from "~/api/@tanstack/react-query.gen";
import { EntityHeader } from "~/components/EntityHeader";
import { createColumns } from "~/components/notes/columns";
import { NotesTable } from "~/components/notes/NotesTable";

export const Route = createFileRoute("/_auth/games/$gameId/notes/")({
	component: RouteComponent,
	loader: ({ params, context }) => {
		return context.queryClient.ensureQueryData(
			listNotesOptions({ path: { game_id: params.gameId } }),
		);
	},
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	const { data, isLoading } = useListNotesQuery(gameId);
	const [searchQuery, setSearchQuery] = useState("");
	const [tagFilter, setTagFilter] = useState("");

	const notes = data?.data || [];

	if (isLoading) {
		return <div className="text-muted-foreground">Loading notes...</div>;
	}
	const columns = createColumns(gameId);

	const navigate = Route.useNavigate();

	const handleCreateNew = () => {
		navigate({ to: "new" });
	};

	return (
		<div className="space-y-4">
			<EntityHeader
				icon="📝"
				title="Notes"
				count={notes.length}
				entityType="note"
				onCreateNew={handleCreateNew}
			/>

			<NotesTable
				columns={columns}
				data={notes}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				tagFilter={tagFilter}
				onTagFilterChange={setTagFilter}
			/>
		</div>
	);
}

const useListNotesQuery = (gameId: string) => {
	return useQuery({ ...listNotesOptions({ path: { game_id: gameId } }) });
};
