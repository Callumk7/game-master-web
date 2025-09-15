import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { signupFn } from "~/routes/signup";
import { useMutationLite } from "../hooks/useMutationLite";
import { loginFn } from "../routes/_auth";
import { Auth } from "./Auth";
import { Button } from "./ui/button";

export function Login() {
	const router = useRouter();

	const loginMutation = useMutationLite({
		fn: loginFn,
		onSuccess: async (ctx) => {
			if (!ctx.data?.error) {
				await router.invalidate();
				router.navigate({ to: "/" });
				return;
			}
		},
	});

	const signupMutation = useMutationLite({
		fn: useServerFn(signupFn),
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
