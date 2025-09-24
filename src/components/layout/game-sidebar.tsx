import { useParams } from "@tanstack/react-router";
import {
	BookOpen,
	Gem,
	Globe,
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
import { useGetGameLinksSuspenseQuery } from "~/queries/games";
import { useGetLocationTreeSuspenseQuery } from "~/queries/locations";
import { useGetQuestTreeSuspenseQuery } from "~/queries/quests";
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
	const { data: links } = useGetGameLinksSuspenseQuery({ id: gameId });
	const characters = resolveEntityArray(links?.data?.entities?.characters);
	const factions = resolveEntityArray(links?.data?.entities?.factions);
	const locations = resolveEntityArray(links?.data?.entities?.locations);
	const notes = resolveEntityArray(links?.data?.entities?.notes);
	const quests = resolveEntityArray(links?.data?.entities?.quests);

	const { data: locationTree } = useGetLocationTreeSuspenseQuery(gameId);
	const { data: questTree } = useGetQuestTreeSuspenseQuery(gameId);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	const totalEntityCount = (characters?.length || 0) + (factions?.length || 0) + (locations?.length || 0) + (notes?.length || 0) + (quests?.length || 0);

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
								to={"/games/$gameId/all"} 
								params={params}
								activeProps={{
									className: "bg-secondary text-secondary-foreground",
								}}
							>
								<Globe className="w-4 h-4" />
								All
								<Badge variant="secondary" className="ml-auto">
									{totalEntityCount.toString()}
								</Badge>
							</SidebarMenuLink>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuLink
								to="/games/$gameId/characters"
								params={params}
								activeProps={{
									className: "bg-secondary text-secondary-foreground",
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
									className: "bg-secondary text-secondary-foreground",
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

						<SidebarMenuLink
							to="/games/$gameId/locations"
							params={params}
							activeProps={{
								className: "bg-secondary text-secondary-foreground",
							}}
						>
							<MapPin className="w-4 h-4" />
							Locations
							<Badge variant="secondary" className="ml-auto">
								{locations?.length.toString() || "0"}
							</Badge>
						</SidebarMenuLink>
						<SidebarMenuItem>
							<SidebarMenuLink
								to="/games/$gameId/quests"
								params={params}
								activeProps={{
									className: "bg-secondary text-secondary-foreground",
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
									className: "bg-secondary text-secondary-foreground",
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
								avatar: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages-wixmp-ed30a86b8c4ca887773594c2.wixmp.com%2Ff%2Fc3f6f733-7289-4186-bc20-1a811747f37f%2Fdj8mxhn-ad79f500-0b82-4a44-9545-b7b3c345971f.jpg%2Fv1%2Ffill%2Fw_894%2Ch_894%2Cq_70%2Cstrp%2Fbilbo_baggins_in_the_civil_war_by_houndhobbit_dj8mxhn-pre.jpg%3Ftoken%3DeyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTAyNCIsInBhdGgiOiJcL2ZcL2MzZjZmNzMzLTcyODktNDE4Ni1iYzIwLTFhODExNzQ3ZjM3ZlwvZGo4bXhobi1hZDc5ZjUwMC0wYjgyLTRhNDQtOTU0NS1iN2IzYzM0NTk3MWYuanBnIiwid2lkdGgiOiI8PTEwMjQifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.daP_x5eECE26Uo4ui9uvt-de5gOkOQbwAj0W3oxvj7c&f=1&nofb=1&ipt=e47750affbcaf6d843dee0e65f5a2f9499b02d76adc2352d92c0c6c02c21b495",
							}}
						/>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarContent>
		</Sidebar>
	);
}

function resolveEntityArray<T>(entityArray: T[] | undefined): T[] {
	if (!entityArray) {
		return [];
	}

	return entityArray;
}
