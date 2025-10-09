import { ClientOnly, createFileRoute, Outlet } from "@tanstack/react-router";
import { Search } from "lucide-react";
import {
	getGameOptions,
	getLocationTreeOptions,
	getQuestTreeOptions,
	listCharactersOptions,
	listFactionsOptions,
	listGameEntitiesOptions,
	listLocationsOptions,
	listNotesOptions,
	listPinnedEntitiesOptions,
	listQuestsOptions,
} from "~/api/@tanstack/react-query.gen";
import { CreateCharacterSheet } from "~/components/characters/create-character-sheet";
import { Commander } from "~/components/commander";
import { EntityTabs, EntityTabsProvider } from "~/components/entity-tabs";
import { BasicErrorComponent } from "~/components/error";
import { CreateFactionSheet } from "~/components/factions/create-faction-sheet";
import { GameSidebar } from "~/components/layout/game-sidebar";
import { CreateLocationSheet } from "~/components/locations/create-location-sheet";
import { CreateNoteSheet } from "~/components/notes/create-note-sheet";
import { CreateQuestSheet } from "~/components/quests/create-quest-sheet";
import { TodosDrawer } from "~/components/todos/todos-drawer";
import { Badge } from "~/components/ui/badge";
import { EntityWindowManager } from "~/components/ui/entity-window-manager";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { useUIActions } from "~/state/ui";

export const Route = createFileRoute("/_auth/games/$gameId")({
	component: RouteComponent,
	loader: async ({ params, context }) => {
		const gameId = params.gameId;
		await context.queryClient.ensureQueryData({
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
		context.queryClient.ensureQueryData(
			listPinnedEntitiesOptions({ path: { game_id: gameId } }),
		);
		context.queryClient.ensureQueryData(
			listCharactersOptions({ path: { game_id: gameId } }),
		);
		context.queryClient.ensureQueryData(
			listFactionsOptions({ path: { game_id: gameId } }),
		);
		context.queryClient.ensureQueryData(
			listNotesOptions({ path: { game_id: gameId } }),
		);
		context.queryClient.ensureQueryData(
			listQuestsOptions({ path: { game_id: gameId } }),
		);
		context.queryClient.ensureQueryData(
			listLocationsOptions({ path: { game_id: gameId } }),
		);
	},
	errorComponent: BasicErrorComponent,
});

// Games Layout
function RouteComponent() {
	const { gameId } = Route.useParams();
	const { setIsCommanderOpen } = useUIActions();

	return (
		<EntityTabsProvider>
			<SidebarProvider>
				<div className="flex h-screen w-full">
					<GameSidebar />
					{/* Main Content */}
					<div className="flex-1 flex flex-col">
						<main className="flex-1 overflow-y-scoll">
							<header className="sticky top-0 border-b p-4 flex items-center gap-4 backdrop-blur-md bg-background/80 z-20 h-[73px]">
								<SidebarTrigger />
								<Commander gameId={gameId} />
								<div className="flex-1 max-w-md">
									<button
										type="button"
										onClick={() => setIsCommanderOpen(true)}
										className="relative w-full h-10 px-3 py-2 text-left text-sm bg-background border border-input rounded-md hover:ring-2 hover:ring-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer flex items-center"
									>
										<Search className="mr-3 w-4 h-4 text-muted-foreground" />
										<span className="text-muted-foreground">
											Search entities...
										</span>
										<Badge
											variant="secondary"
											className="ml-auto text-xs"
										>
											⌘J
										</Badge>
									</button>
								</div>
							</header>
							<EntityTabs />
							<div className="mb-16">
								<Outlet />
							</div>
						</main>
						<CreateCharacterSheet />
						<CreateFactionSheet />
						<CreateNoteSheet />
						<CreateLocationSheet />
						<CreateQuestSheet />
						<EntityWindowManager />
						<ClientOnly>
							<TodosDrawer />
						</ClientOnly>
					</div>
				</div>
			</SidebarProvider>
		</EntityTabsProvider>
	);
}
