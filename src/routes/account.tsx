import { createFileRoute } from "@tanstack/react-router";
import { AuthenticatedLayout } from "~/components/authenticated-layout";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";

export const Route = createFileRoute("/account")({
	component: RouteComponent,
});

function RouteComponent() {
	const { user } = Route.useRouteContext();

	if (!user) {
		return <h1>You are not logged in.</h1>;
	}

	return (
		<AuthenticatedLayout user={user!}>
			<Card className="max-w-md mx-auto mt-8">
				<CardHeader>
					<CardTitle>Profile</CardTitle>
					<CardDescription>Manage your account details.</CardDescription>
				</CardHeader>
				<CardContent>
					<div>
						<p>Email: {user.email}</p>
					</div>
				</CardContent>
			</Card>
		</AuthenticatedLayout>
	);
}
