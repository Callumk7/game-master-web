import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SplitViewLayout } from "~/components/layout/split-view";

const splitViewSearchSchema = z.object({
	left: z.string().optional(),
	right: z.string().optional(),
});

export const Route = createFileRoute("/_auth/games/$gameId/split")({
	component: RouteComponent,
	validateSearch: splitViewSearchSchema,
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	const search = Route.useSearch();

	return (
		<SplitViewLayout
			gameId={gameId}
			leftPane={search.left}
			rightPane={search.right}
		/>
	);
}
