import { createFileRoute } from "@tanstack/react-router";
import { Container } from "~/components/container";

export const Route = createFileRoute("/confirm-email")({
	ssr: true,
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Container>
			<h1>Confirm Email</h1>
			<p>Please check your email for a confirmation link.</p>
		</Container>
	);
}
