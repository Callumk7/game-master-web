import { createFileRoute, Outlet } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useLayoutEffect } from "react";
import { loginUser } from "~/api";
import { Login } from "~/components/Login";
import { clearApiAuth, updateApiAuth } from "~/utils/api-client";
import { getAppSession } from "~/utils/session";

export const loginFn = createServerFn({ method: "POST" })
	.validator((d: { email: string; password: string }) => d)
	.handler(async ({ data }) => {
		const { data: loginData, error } = await loginUser({ body: data });

		if (error) {
			return {
				error: true,
				message: "There was an error",
				userNotFound: true,
			};
		}

		// Create a session
		const session = await getAppSession();

		// Store the user's email in the session
		await session.update({
			user: loginData.user,
			token: loginData.token,
		});
	});

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
