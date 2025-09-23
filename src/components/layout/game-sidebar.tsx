import { useParams } from "@tanstack/react-router";
import {
	BookOpen,
	Gem,
	Home,
	MapPin,
	Moon,
	Network,
	Plus,
	Scroll,
	Sun,
	Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuLink,
} from "~/components/ui/sidebar";
import { useGetGameLinksQuery } from "~/queries/games";
import { useGetLocationTree } from "~/queries/locations";
import { useGetQuestTree } from "~/queries/quests";
import { SidebarTree } from "./tree";
import { NavUser } from "./user-sidebar";

interface GameSidebarProps {
	setNewCharSheetOpen: (isOpen: boolean) => void;
	setNewFactionSheetOpen: (isOpen: boolean) => void;
	setNewLocationSheetOpen: (isOpen: boolean) => void;
	setNewNoteSheetOpen: (isOpen: boolean) => void;
	setNewQuestSheetOpen: (isOpen: boolean) => void;
}

export function GameSidebar({
	setNewCharSheetOpen,
	setNewFactionSheetOpen,
	setNewLocationSheetOpen,
	setNewNoteSheetOpen,
	setNewQuestSheetOpen,
}: GameSidebarProps) {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	const params = useParams({ from: "/_auth/games/$gameId" });
	const gameId = params.gameId;

	// TODO: This needs to be cleaned up, and probably extracted to a hook / function
	const { data: links } = useGetGameLinksQuery({ id: gameId });
	const characters = links?.data?.entities?.characters;
	const factions = links?.data?.entities?.factions;
	const locations = links?.data?.entities?.locations;
	const notes = links?.data?.entities?.notes;
	const quests = links?.data?.entities?.quests;

	const { data: locationTree } = useGetLocationTree(gameId);
	const { data: questTree } = useGetQuestTree(gameId);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<Sidebar>
			<SidebarHeader className="border-b p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<BookOpen className="w-6 h-6" />
						<span className="font-bold">DM Editor</span>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
					>
						{mounted ? (
							theme === "dark" ? (
								<Sun className="w-4 h-4" />
							) : (
								<Moon className="w-4 h-4" />
							)
						) : (
							<div className="w-4 h-4" />
						)}
					</Button>
				</div>
			</SidebarHeader>
			<SidebarContent className="p-4 flex flex-col">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuLink to="/games/$gameId" params={params}>
							<Home className="w-4 h-4" />
							Dashboard
						</SidebarMenuLink>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton>
							<Network className="w-4 h-4" />
							Relationship Graph
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
				<div className="mt-6">
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
							Entities
						</h3>
					</div>

					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuLink
								to="/games/$gameId/characters"
								params={params}
								activeProps={{
									className:
										"bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
								}}
							>
								<Users className="w-4 h-4" />
								Characters
								<Badge variant="secondary" className="ml-auto">
									{characters?.length.toString() || "0"}
								</Badge>
							</SidebarMenuLink>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuLink
								to="/games/$gameId/factions"
								params={params}
								activeProps={{
									className:
										"bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
								}}
							>
								<div className="w-4 h-4 flex items-center justify-center text-sm">
									⚔
								</div>
								Factions
								<Badge variant="secondary" className="ml-auto">
									{factions?.length.toString() || "0"}
								</Badge>
							</SidebarMenuLink>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuLink
								to="/games/$gameId/locations"
								params={params}
								activeProps={{
									className:
										"bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
								}}
							>
								<MapPin className="w-4 h-4" />
								Locations
								<Badge variant="secondary" className="ml-auto">
									{locations?.length.toString() || "0"}
								</Badge>
							</SidebarMenuLink>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuLink
								to="/games/$gameId/quests"
								params={params}
								activeProps={{
									className:
										"bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
								}}
							>
								<Gem className="w-4 h-4" />
								Quests
								<Badge variant="secondary" className="ml-auto">
									{quests?.length.toString() || "0"}
								</Badge>
							</SidebarMenuLink>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuLink
								to="/games/$gameId/notes"
								params={params}
								activeProps={{
									className:
										"bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
								}}
							>
								<Scroll className="w-4 h-4" />
								Notes
								<Badge variant="secondary" className="ml-auto">
									{notes?.length.toString() || "0"}
								</Badge>
							</SidebarMenuLink>
						</SidebarMenuItem>
					</SidebarMenu>

					<SidebarGroup>
						<SidebarGroupLabel>Locations</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{locationTree?.data?.map((item) => (
									<SidebarTree
										gameId={gameId}
										key={item.id}
										parentNode={item}
										type="location"
									/>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
					<SidebarGroup>
						<SidebarGroupLabel>Quests</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{questTree?.data?.map((item) => (
									<SidebarTree
										gameId={gameId}
										key={item.id}
										parentNode={item}
										type="quest"
									/>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>

					<div className="mt-4 space-y-2">
						<Button
							onClick={() => setNewNoteSheetOpen(true)}
							size="sm"
							variant="outline"
							className="w-full justify-start"
						>
							<Plus className="w-4 h-4 mr-2" />
							New Note
						</Button>
						<Button
							onClick={() => setNewCharSheetOpen(true)}
							size="sm"
							variant="outline"
							className="w-full justify-start"
						>
							<Plus className="w-4 h-4 mr-2" />
							New Character
						</Button>
						<Button
							onClick={() => setNewFactionSheetOpen(true)}
							size="sm"
							variant="outline"
							className="w-full justify-start"
						>
							<Plus className="w-4 h-4 mr-2" />
							New Faction
						</Button>
						<Button
							onClick={() => setNewLocationSheetOpen(true)}
							size="sm"
							variant="outline"
							className="w-full justify-start"
						>
							<Plus className="w-4 h-4 mr-2" />
							New Location
						</Button>
						<Button
							onClick={() => setNewQuestSheetOpen(true)}
							size="sm"
							variant="outline"
							className="w-full justify-start"
						>
							<Plus className="w-4 h-4 mr-2" />
							New Quest
						</Button>
					</div>
				</div>
				<div className="flex-1" />
				<SidebarMenu>
					<SidebarMenuItem>
						<NavUser
							user={{
								name: "Callum",
								email: "callum@example.com",
								avatar: "https://avatars.dicebear.com/api/initials/callum@example.com.svg",
							}}
						/>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarContent>
		</Sidebar>
	);
}
