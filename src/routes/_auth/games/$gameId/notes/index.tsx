import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { listNotesOptions } from "~/api/@tanstack/react-query.gen";
import { NotesTable } from "~/components/notes/notes-table";
import { PageHeader } from "~/components/page-header";
import { useListNotesSuspenseQuery } from "~/queries/notes";

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
	const { data, isLoading } = useListNotesSuspenseQuery(gameId);
	const [searchQuery, setSearchQuery] = useState("");
	const [tagFilter, setTagFilter] = useState("");
	const [paginationSize, setPaginationSize] = useState(10);
	const navigate = useNavigate();

	const notes = data?.data || [];

	if (isLoading) {
		return <div className="text-muted-foreground">Loading notes...</div>;
	}

	const handleCreate = () => {
		navigate({ to: "/games/$gameId/notes/new", params: { gameId } });
	};

	return (
		<div className="container mx-auto py-8">
			<PageHeader
				title="All Notes"
				description="Browse all notes in your game."
				handleCreate={handleCreate}
			/>
			<NotesTable
				gameId={gameId}
				data={notes}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				tagFilter={tagFilter}
				onTagFilterChange={setTagFilter}
				paginationSize={paginationSize}
				onPaginationSizeChange={setPaginationSize}
			/>
		</div>
	);
}
