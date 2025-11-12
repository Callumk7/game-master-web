import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { loginUser } from "~/api";
import { parseApiErrors } from "~/utils/parse-errors";
import { getAppSession } from "~/utils/session";
import { Auth } from "./auth";

export const loginFn = createServerFn({ method: "POST" })
	.inputValidator((d: { email: string; password: string }) => d)
	.handler(async ({ data }) => {
		const { data: loginData, error } = await loginUser({ body: data });

		if (error) {
			return {
				error: true,
				message: parseApiErrors(error),
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
				loginMutation.data?.error ? (
					<div className="text-destructive text-sm mt-2">
						{loginMutation.data.message}
					</div>
				) : null
			}
		/>
	);
}
