import { createFileRoute } from "@tanstack/react-router";
import { Container } from "~/components/container";
import { Login } from "~/components/login";

export const Route = createFileRoute("/login")({
	component: LoginComp,
});

function LoginComp() {
	return (
		<Container>
			<Login />
		</Container>
	);
}
