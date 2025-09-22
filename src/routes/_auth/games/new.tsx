import { createFileRoute } from "@tanstack/react-router";
import { CreateGameFormV2 } from "~/components/games/create-game-form-v2";
import { CreateGameFormV3 } from "~/components/games/create-game-form-v3";

export const Route = createFileRoute("/_auth/games/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="max-w-2xl mx-auto bg-card p-6 mt-20 rounded-lg shadow-md">
			<h2>Hello "/games/new"!</h2>
			<CreateGameFormV2 />
			<CreateGameFormV3 />
		</div>
	);
}
