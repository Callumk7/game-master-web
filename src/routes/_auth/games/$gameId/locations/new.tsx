import { createFileRoute } from "@tanstack/react-router";
import { Container } from "~/components/container";
import { CreateLocationForm } from "~/components/locations/create-location-form";

export const Route = createFileRoute("/_auth/games/$gameId/locations/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Container>
			<CreateLocationForm />
		</Container>
	);
}
