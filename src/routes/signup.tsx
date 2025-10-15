import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { signupUser } from "~/api";
import { Auth } from "~/components/auth";
import { Container } from "~/components/container";
import { parseApiErrors } from "~/utils/parse-errors";
import { getAppSession } from "~/utils/session";

export const signupFn = createServerFn({ method: "POST" })
	.inputValidator((d: { email: string; password: string; redirectUrl?: string }) => d)
	.handler(async ({ data }) => {
		const { data: signupData, error } = await signupUser({ body: data });

		if (error) {
			console.log(error);
			return {
				error: true,
				message: parseApiErrors(error),
			};
		}

		// Create a session
		const session = await getAppSession();

		if (signupData) {
			// Store the user's email in the session
			await session.update({
				user: signupData.user,
				token: signupData.token,
			});

			// Redirect to the prev page stored in the "redirect" search param
			throw redirect({
				href: data.redirectUrl || "/",
			});
		}

		// Redirect to the prev page stored in the "redirect" search param
		throw redirect({
			href: data.redirectUrl || "/",
		});
	});

export const Route = createFileRoute("/signup")({
	component: SignupComp,
});

function SignupComp() {
	const signupMutation = useMutation({
		mutationFn: useServerFn(signupFn),
	});

	return (
		<Container>
			<Auth
				actionText="Sign Up"
				status={signupMutation.status}
				onSubmit={(e) => {
					const formData = new FormData(e.target as HTMLFormElement);

					signupMutation.mutate({
						data: {
							email: formData.get("email") as string,
							password: formData.get("password") as string,
						},
					});
				}}
				afterSubmit={
					signupMutation.data?.error ? (
						<div className="text-red-400">{signupMutation.data.message}</div>
					) : null
				}
			/>
		</Container>
	);
}
