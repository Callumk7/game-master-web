import * as React from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Search } from "lucide-react";
import {
	getGameOptions,
	getLocationTreeOptions,
	getQuestTreeOptions,
	listGameEntitiesOptions,
} from "~/api/@tanstack/react-query.gen";
import { CreateCharacterSheet } from "~/components/characters/CreateCharacterSheet";
import { Commander } from "~/components/commander";
import { EntityTabs, EntityTabsProvider } from "~/components/entity-tabs";
import { GameSidebar } from "~/components/layout/game-sidebar";
import { Input } from "~/components/ui/input";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { CreateFactionSheet } from "~/components/factions/CreateFactionSheet";
import { CreateNoteSheet } from "~/components/notes/create-note-sheet";

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
					</div>
				</div>
			</SidebarProvider>
		</EntityTabsProvider>
	);
}
