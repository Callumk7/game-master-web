import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Search } from "lucide-react";
import {
	getGameOptions,
	getLocationTreeOptions,
	getQuestTreeOptions,
	listGameEntitiesOptions,
} from "~/api/@tanstack/react-query.gen";
import { Commander } from "~/components/commander";
import { EntityTabs, EntityTabsProvider } from "~/components/entity-tabs";
import { GameSidebar } from "~/components/layout/game-sidebar";
import { Input } from "~/components/ui/input";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";

export const Route = createFileRoute("/_auth/games/$gameId")({
	component: RouteComponent,
	loader: ({ params, context }) => {
		const gameId = params.gameId;
		context.queryClient.ensureQueryData({
			...getGameOptions({ path: { id: gameId } }),
		});
		context.queryClient.ensureQueryData(
			listGameEntitiesOptions({ path: { game_id: gameId } }),
		);
		context.queryClient.ensureQueryData(
			getLocationTreeOptions({ path: { game_id: gameId } }),
		);
		context.queryClient.ensureQueryData(
			getQuestTreeOptions({ path: { game_id: gameId } }),
		);
	},
});

// Games Layout
function RouteComponent() {
	const { gameId } = Route.useParams();
	return (
		<EntityTabsProvider>
			<SidebarProvider>
				<div className="flex h-screen w-full">
					<GameSidebar />
					{/* Main Content */}
					<div className="flex-1 flex flex-col">
						<header className="border-b p-4 flex items-center gap-4">
							<SidebarTrigger />
							<Commander gameId={gameId} />
							<div className="flex-1 max-w-md">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
									<Input
										placeholder="Search entities..."
										className="pl-10"
									/>
								</div>
							</div>
						</header>

						<main className="flex-1 overflow-auto p-6">
							<EntityTabs />
							<Outlet />
						</main>
					</div>
				</div>
			</SidebarProvider>
		</EntityTabsProvider>
	);
}
