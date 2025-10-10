import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { loginUser } from "~/api";
import { signupFn } from "~/routes/signup";
import { getAppSession } from "~/utils/session";
import { Auth } from "./auth";
import { Button } from "./ui/button";

export const loginFn = createServerFn({ method: "POST" })
	.inputValidator((d: { email: string; password: string }) => d)
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

export function Login() {
	const router = useRouter();

	const loginMutation = useMutation({
		mutationFn: loginFn,
		onSuccess: async (ctx) => {
			if (!ctx?.error) {
				await router.invalidate();
				router.navigate({ to: "/" });
				return;
			}
		},
	});

	const signupMutation = useMutation({
		mutationFn: useServerFn(signupFn),
	});

	return (
		<Auth
			actionText="Login"
			status={loginMutation.status}
			onSubmit={(e) => {
				const formData = new FormData(e.target as HTMLFormElement);

				loginMutation.mutate({
					data: {
						email: formData.get("email") as string,
						password: formData.get("password") as string,
					},
				});
			}}
			afterSubmit={
				loginMutation.data ? (
					<>
						<div className="text-red-400">{loginMutation.data.message}</div>
						{loginMutation.data.userNotFound ? (
							<div>
								<Button
									onClick={(e) => {
										const formData = new FormData(
											(e.target as HTMLButtonElement).form!,
										);

										signupMutation.mutate({
											data: {
												email: formData.get("email") as string,
												password: formData.get(
													"password",
												) as string,
											},
										});
									}}
									type="button"
								>
									Sign up instead?
								</Button>
							</div>
						) : null}
					</>
				) : null
			}
		/>
	);
}
