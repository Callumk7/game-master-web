import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { clearApiAuth, updateApiAuth } from "~/utils/api-client";

export const Route = createFileRoute("/_auth")({
	beforeLoad: ({ context, location }) => {
		if (!context.token) {
			throw redirect({
				to: "/login",
				search: { redirect: location.href },
			});
		}

		updateApiAuth(context.token);
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
