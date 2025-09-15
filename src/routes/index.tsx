import { createFileRoute } from "@tanstack/react-router";
import { AuthenticatedLayout } from "~/components/AuthenticatedLayout";
import { Login } from "~/components/Login";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Link } from "~/components/ui/link";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const { user, token } = Route.useRouteContext();

	if (!token || !user) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center">
				<div className="max-w-md w-full">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold mb-2">Game Master</h1>
						<p>Login to see your games</p>
					</div>
					<Login />
				</div>
			</div>
		);
	}

	return (
		<AuthenticatedLayout user={user}>
			<div className="w-1/2 mx-auto">
				<Card>
					<CardHeader>
						<CardTitle>Welcome back, {user.email.split("@")[0]}!</CardTitle>
						<CardDescription>Ready to manage your campaigns?</CardDescription>
					</CardHeader>
					<CardContent>
						<Link to="/games" variant="default">
							Go to Games
						</Link>
					</CardContent>
				</Card>
			</div>
		</AuthenticatedLayout>
	);
}
