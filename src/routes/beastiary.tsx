import { createFileRoute } from "@tanstack/react-router";
import { AuthenticatedLayout } from "~/components/authenticated-layout";
import { MonsterTable } from "~/components/monster-table";
import type { MonsterData } from "~/types/monsters";
import mmData from "../../data/beastiary/mm.json";

export const Route = createFileRoute("/beastiary")({
	component: Beastiary,
});

function Beastiary() {
	const { user, token } = Route.useRouteContext();

	if (!token || !user) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center">
				<div className="max-w-md w-full text-center">
					<h1 className="text-3xl font-bold mb-4">Monster Manual</h1>
					<p className="text-muted-foreground mb-8">
						Please log in to access the Monster Manual.
					</p>
					<a
						href="/login"
						className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
					>
						Log In
					</a>
				</div>
			</div>
		);
	}

	return (
		<AuthenticatedLayout user={user}>
			<div className="container mx-auto py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold">Monster Manual</h1>
					<p className="text-muted-foreground mt-2">
						Browse and search through the Monster Manual creatures
					</p>
				</div>

				<MonsterTable monsters={monsters} />
			</div>
		</AuthenticatedLayout>
	);
}
