import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { getGameOptions, listGameEntitiesOptions } from "~/api/@tanstack/react-query.gen";
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
	},
});

export const useGetGameQuery = ({ id }: { id: string }) => {
	return useSuspenseQuery(getGameOptions({ path: { id } }));
};

export const useGetGameLinksQuery = ({ id }: { id: string }) => {
	return useSuspenseQuery(listGameEntitiesOptions({ path: { game_id: id } }));
};

// Games Layout
function RouteComponent() {
	return (
		<SidebarProvider>
			<div className="flex h-screen w-full">
				<GameSidebar />
				{/* Main Content */}
				<div className="flex-1 flex flex-col">
					<header className="border-b p-4 flex items-center gap-4">
						<SidebarTrigger />
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
						<Outlet />
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
