import { createFileRoute } from "@tanstack/react-router";
import { AuthenticatedLayout } from "~/components/authenticated-layout";
import { CreateGameForm } from "~/components/games/create-game-form";

export const Route = createFileRoute("/_auth/games/new")({
	ssr: true,
	component: RouteComponent,
});

function RouteComponent() {
	const { user } = Route.useRouteContext();
	return (
		<AuthenticatedLayout user={user!}>
			<div className="max-w-2xl mx-auto bg-card p-6 mt-20 rounded-lg shadow-md">
				<CreateGameForm />
			</div>
		</AuthenticatedLayout>
	);
}
