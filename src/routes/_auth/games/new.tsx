import { createFileRoute } from "@tanstack/react-router";
import { CreateGameForm } from "~/components/games/create-game-form";

export const Route = createFileRoute("/_auth/games/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="max-w-2xl mx-auto bg-card p-6 mt-20 rounded-lg shadow-md">
			<CreateGameForm />
		</div>
	);
}
