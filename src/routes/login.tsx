import { createFileRoute, redirect } from "@tanstack/react-router";
import { Login } from "~/components/login";

export const Route = createFileRoute("/login")({
	component: LoginComp,
	beforeLoad: async ({ context }) => {
		// Redirect authenticated users to games
		if (context.token && context.user) {
			throw redirect({ to: "/games" });
		}
	},
});

function LoginComp() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-background">
			<div className="max-w-md w-full px-4">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold mb-2">Game Master</h1>
					<p className="text-muted-foreground">
						Manage your campaigns and adventures
					</p>
				</div>
				<Login />
			</div>
		</div>
	);
}
