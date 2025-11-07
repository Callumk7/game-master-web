import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { signupUser } from "~/api";
import { Auth } from "~/components/auth";
import { Container } from "~/components/container";
import { parseApiErrors } from "~/utils/parse-errors";

export const signupFn = createServerFn({ method: "POST" })
	.inputValidator((d: { email: string; password: string; redirectUrl?: string }) => d)
	.handler(async ({ data }) => {
		const { error } = await signupUser({ body: data });

		if (error) {
			return {
				error: true,
				message: parseApiErrors(error),
			};
		}

		throw redirect({
			href: "/confirm-email",
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
