import { createFileRoute } from "@tanstack/react-router";
import { Scroll } from "lucide-react";
import { listNotesOptions } from "~/api/@tanstack/react-query.gen";
import { Container } from "~/components/container";
import { NotesTable } from "~/components/notes/notes-table";
import { PageHeader } from "~/components/page-header";
import { useListNotesSuspenseQuery } from "~/queries/notes";
import { useUIActions } from "~/state/ui";

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
	const { data } = useListNotesSuspenseQuery(gameId);

	const notes = data?.data || [];

	const { setIsCreateNoteOpen } = useUIActions();

	const handleCreate = () => {
		setIsCreateNoteOpen(true);
	};

	return (
		<Container>
			<PageHeader
				title="All Notes"
				description="Browse all notes in your game."
				Icon={Scroll}
				handleCreate={handleCreate}
			/>
			<NotesTable gameId={gameId} data={notes} />
		</Container>
	);
}
