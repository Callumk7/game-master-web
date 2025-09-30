import { createFileRoute } from "@tanstack/react-router";
import {
	getGameEntityTreeOptions,
	useGetGameEntityTreeQuery,
} from "~/api/@tanstack/react-query.gen";
import { PageHeader } from "~/components/page-header";

export const Route = createFileRoute("/_auth/games/$gameId/tree")({
	component: RouteComponent,
	loader: async ({ params, context }) => {
		await context.queryClient.ensureQueryData(
			getGameEntityTreeOptions({ path: { game_id: params.gameId } }),
		);
	},
});

function RouteComponent() {
	const { gameId } = Route.useParams();
	const { data } = useGetGameEntityTreeQuery({ path: { game_id: gameId } });
	return (
		<div>
			<PageHeader title="Game Entity Tree" />
			<pre>{JSON.stringify(data, null, 2)}</pre>
		</div>
	);
}
