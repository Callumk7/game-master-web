import { ClientOnly, createFileRoute, Outlet } from "@tanstack/react-router";
import {
	getGameOptions,
	getLocationTreeOptions,
	getQuestTreeOptions,
	listGameEntitiesOptions,
	listPinnedEntitiesOptions,
} from "~/api/@tanstack/react-query.gen";
import { CreateCharacterSheet } from "~/components/characters/create-character-sheet";
import { EditCharacterDialog } from "~/components/characters/edit-character-dialog";
import { Commander, CommanderTrigger } from "~/components/commander";
import { EntityTabs } from "~/components/entity-tabs";
import { BasicErrorComponent } from "~/components/error";
import { CreateFactionSheet } from "~/components/factions/create-faction-sheet";
import { EditFactionDialog } from "~/components/factions/edit-faction-dialog";
import { EntityWindowManager } from "~/components/layout/entity-window-manager";
import { GameSidebar } from "~/components/layout/game-sidebar";
import { WindowTray } from "~/components/layout/window-tray";
import { CreateLocationSheet } from "~/components/locations/create-location-sheet";
import { EditLocationDialog } from "~/components/locations/edit-location-dialog";
import { CreateNoteSheet } from "~/components/notes/create-note-sheet";
import { EditNoteDialog } from "~/components/notes/edit-note-dialog";
import { CreateQuestSheet } from "~/components/quests/create-quest-sheet";
import { EditQuestDialog } from "~/components/quests/edit-quest-dialog";
import { TodosDrawer } from "~/components/todos/todos-drawer";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";

export const Route = createFileRoute("/_auth/games/$gameId")({
	component: RouteComponent,
	loader: async ({ params, context }) => {
		const gameId = params.gameId;
		context.queryClient.ensureQueryData({
			...getGameOptions({ path: { id: gameId } }),
		});
		context.queryClient.ensureQueryData(
			getLocationTreeOptions({ path: { game_id: gameId } }),
		);
		context.queryClient.ensureQueryData(
			getQuestTreeOptions({ path: { game_id: gameId } }),
		);
		context.queryClient.ensureQueryData(
			listPinnedEntitiesOptions({ path: { game_id: gameId } }),
		);
		await context.queryClient.ensureQueryData(
			listGameEntitiesOptions({ path: { game_id: gameId } }),
		);
	},
	errorComponent: BasicErrorComponent,
});

// Games Layout
function RouteComponent() {
	const { gameId } = Route.useParams();

	return (
		<SidebarProvider>
			<div className="flex h-screen w-full">
				<GameSidebar />
				{/* Main Content */}
				<div className="flex-1 flex flex-col min-w-0">
					<main className="relative max-w-full flex-1 overflow-y-hidden">
						<header className="sticky top-0 border-b p-4 flex items-center gap-4 backdrop-blur-md bg-background/80 z-20 h-[73px]">
							<SidebarTrigger />
							<Commander gameId={gameId} />
							<CommanderTrigger />
						</header>
						<EntityTabs gameId={gameId} />
						<div className="w-full overflow-y-scroll h-[calc(100vh-120px)] top-[80px]">
							<Outlet />
						</div>
					</main>
					<CreateCharacterSheet />
					<CreateFactionSheet />
					<CreateNoteSheet />
					<CreateLocationSheet />
					<CreateQuestSheet />
					<EntityWindowManager />
					<EditCharacterDialog gameId={gameId} />
					<EditFactionDialog gameId={gameId} />
					<EditLocationDialog gameId={gameId} />
					<EditNoteDialog gameId={gameId} />
					<EditQuestDialog gameId={gameId} />
					<WindowTray />
					<ClientOnly>
						<TodosDrawer />
					</ClientOnly>
				</div>
			</div>
		</SidebarProvider>
	);
}
