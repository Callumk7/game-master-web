import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getAppSession } from "~/utils/session";
import { useEffect } from "react";

const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
	const session = await getAppSession();
	await session.clear();
});

export const Route = createFileRoute("/logout")({
	component: RouteComponent,
});

function RouteComponent() {
	useEffect(() => {
		const logout = async () => {
			await logoutFn();
			window.location.href = "/";
		};
		logout();
	}, []);

	return <div>Logging out...</div>;
}
