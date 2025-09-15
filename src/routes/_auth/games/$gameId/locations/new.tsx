import { createFileRoute } from "@tanstack/react-router";
import { CreateLocationFormV2 } from "~/components/locations/CreateLocationFormV2";

export const Route = createFileRoute("/_auth/games/$gameId/locations/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<CreateLocationFormV2 />
		</div>
	);
}
