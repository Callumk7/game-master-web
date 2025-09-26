import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Search } from "lucide-react";
import * as React from "react";
import {
	getGameOptions,
	getLocationTreeOptions,
	getQuestTreeOptions,
	listGameEntitiesOptions,
	listPinnedEntitiesOptions,
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
import { Badge } from "~/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";

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
	},
	errorComponent: BasicErrorComponent,
});

// Games Layout
function RouteComponent() {
	const { gameId } = Route.useParams();

	const [commanderOpen, setCommanderOpen] = React.useState(false);
	const [newCharSheetOpen, setNewCharSheetOpen] = React.useState(false);
	const [newFactionSheetOpen, setNewFactionSheetOpen] = React.useState(false);
	const [newLocationSheetOpen, setNewLocationSheetOpen] = React.useState(false);
	const [newNoteSheetOpen, setNewNoteSheetOpen] = React.useState(false);
	const [newQuestSheetOpen, setNewQuestSheetOpen] = React.useState(false);

	return (
		<EntityTabsProvider>
			<SidebarProvider>
				<div className="flex h-screen w-full">
					<GameSidebar
						setNewCharSheetOpen={setNewCharSheetOpen}
						setNewFactionSheetOpen={setNewFactionSheetOpen}
						setNewLocationSheetOpen={setNewLocationSheetOpen}
						setNewNoteSheetOpen={setNewNoteSheetOpen}
						setNewQuestSheetOpen={setNewQuestSheetOpen}
					/>
					{/* Main Content */}
					<div className="flex-1 flex flex-col">
						<main className="flex-1 overflow-auto">
							<header className="sticky top-0 border-b p-4 flex items-center gap-4 backdrop-blur-md bg-background/80 z-20">
								<SidebarTrigger />
								<Commander 
									gameId={gameId} 
									open={commanderOpen} 
									setOpen={setCommanderOpen} 
								/>
								<div className="flex-1 max-w-md">
									<button
										onClick={() => setCommanderOpen(true)}
										className="relative w-full h-10 px-3 py-2 text-left text-sm bg-background border border-input rounded-md hover:ring-2 hover:ring-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer flex items-center"
									>
										<Search className="mr-3 w-4 h-4 text-muted-foreground" />
										<span className="text-muted-foreground">Search entities...</span>
										<Badge variant="secondary" className="ml-auto text-xs">
											⌘J
										</Badge>
									</button>
								</div>
							</header>
							<EntityTabs />
							<div className="p-6">
								<Outlet />
							</div>
						</main>
						<CreateCharacterSheet
							isOpen={newCharSheetOpen}
							setIsOpen={setNewCharSheetOpen}
						/>
						<CreateFactionSheet
							isOpen={newFactionSheetOpen}
							setIsOpen={setNewFactionSheetOpen}
						/>
						<CreateNoteSheet
							isOpen={newNoteSheetOpen}
							setIsOpen={setNewNoteSheetOpen}
						/>
						<CreateLocationSheet
							isOpen={newLocationSheetOpen}
							setIsOpen={setNewLocationSheetOpen}
						/>
						<CreateQuestSheet
							isOpen={newQuestSheetOpen}
							setIsOpen={setNewQuestSheetOpen}
						/>
					</div>
				</div>
			</SidebarProvider>
		</EntityTabsProvider>
	);
}
