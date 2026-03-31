import { createFileRoute } from "@tanstack/react-router";
import { GameCanvas } from "~/components/canvas";

export const Route = createFileRoute("/_auth/games/$gameId/canvas")({
	component: CanvasRoute,
});

function CanvasRoute() {
	const { gameId } = Route.useParams();
	return (
		<div className="h-full w-full">
			<GameCanvas gameId={gameId} />
		</div>
	);
}
