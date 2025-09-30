import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { Login } from "~/components/login";
import { clearApiAuth, updateApiAuth } from "~/utils/api-client";

export const Route = createFileRoute("/_auth")({
	beforeLoad: ({ context }) => {
		if (!context.token) {
			throw new Error("Not authenticated");
		}

		updateApiAuth(context.token);
	},
	errorComponent: ({ error }) => {
		if (error.message === "Not authenticated") {
			return <Login />;
		}

		throw error;
	},
	component: AuthLayout,
});

function AuthLayout() {
	const { token } = Route.useRouteContext();
	useLayoutEffect(() => {
		if (token) {
			updateApiAuth(token);
		} else {
			clearApiAuth();
		}
	}, [token]);

	return <Outlet />;
}
