import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { signupUser } from "~/api";
import { Auth } from "~/components/auth";
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
	beforeLoad: async ({ context }) => {
		// Redirect authenticated users to games
		if (context.token && context.user) {
			throw redirect({ to: "/games" });
		}
	},
});

function SignupComp() {
	const signupMutation = useMutation({
		mutationFn: useServerFn(signupFn),
	});

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-background">
			<div className="max-w-md w-full px-4">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold mb-2">Game Master</h1>
					<p className="text-muted-foreground">Create your account</p>
				</div>
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
							<div className="text-destructive text-sm mt-2">
								{signupMutation.data.message}
							</div>
						) : null
					}
				/>
			</div>
		</div>
	);
}
