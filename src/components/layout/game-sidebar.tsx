import { useParams } from "@tanstack/react-router";
import {
	BookOpen,
	ChevronRight,
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
import type { LocationTreeNode, QuestTreeNode } from "~/api";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Link } from "~/components/ui/link";
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
	SidebarMenuSub,
} from "~/components/ui/sidebar";
import { useGetGameLinksQuery } from "~/queries/games";
import { useGetLocationTree } from "~/queries/locations";
import { useGetQuestTree } from "~/queries/quests";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { NavUser } from "./user-sidebar";

export function GameSidebar() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	const params = useParams({ from: "/_auth/games/$gameId" });
	const gameId = params.gameId;

	// TODO: This needs to be cleaned up, and probably extracted to a hook / function
	const { data: links, isLoading: linksLoading } = useGetGameLinksQuery({ id: gameId });
	const characters = links?.data?.entities?.characters;
	const factions = links?.data?.entities?.factions;
	const locations = links?.data?.entities?.locations;
	const notes = links?.data?.entities?.notes;
	const quests = links?.data?.entities?.quests;

	const { data: locationTree, isLoading: locationTreeLoading } =
		useGetLocationTree(gameId);
	const { data: questTree, isLoading: questTreeLoading } = useGetQuestTree(gameId);

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
									{linksLoading
										? "..."
										: characters?.length.toString() || "0"}
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
									{linksLoading
										? "..."
										: factions?.length.toString() || "0"}
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
									{linksLoading
										? "..."
										: locations?.length.toString() || "0"}
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
									{linksLoading
										? "..."
										: quests?.length.toString() || "0"}
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
									{linksLoading
										? "..."
										: notes?.length.toString() || "0"}
								</Badge>
							</SidebarMenuLink>
						</SidebarMenuItem>
					</SidebarMenu>

					<SidebarGroup>
						<SidebarGroupLabel>Locations</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{locationTreeLoading ? (
									<div className="text-muted-foreground text-sm p-2">
										Loading locations...
									</div>
								) : (
									locationTree?.data?.map((item) => (
										<LocationTree
											gameId={gameId}
											key={item.id}
											item={item}
										/>
									))
								)}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
					<SidebarGroup>
						<SidebarGroupLabel>Quests</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{questTreeLoading ? (
									<div className="text-muted-foreground text-sm p-2">
										Loading quests...
									</div>
								) : (
									questTree?.data?.map((item) => (
										<QuestTree
											gameId={gameId}
											key={item.id}
											item={item}
										/>
									))
								)}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>

					<div className="mt-4 space-y-2">
						<Link
							to="/games/$gameId/notes/new"
							params={params}
							size="sm"
							variant="outline"
							className="w-full justify-start"
							activeProps={{
								className:
									"w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
							}}
						>
							<Plus className="w-4 h-4 mr-2" />
							New Note
						</Link>
						<Link
							to="/games/$gameId/characters/new"
							params={params}
							size="sm"
							variant="outline"
							className="w-full justify-start"
							activeProps={{
								className:
									"w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
							}}
						>
							<Plus className="w-4 h-4 mr-2" />
							New Character
						</Link>
						<Link
							to="/games/$gameId/factions/new"
							params={params}
							size="sm"
							variant="outline"
							className="w-full justify-start"
							activeProps={{
								className:
									"w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
							}}
						>
							<Plus className="w-4 h-4 mr-2" />
							New Faction
						</Link>
						<Link
							to="/games/$gameId/locations/new"
							params={params}
							size="sm"
							variant="outline"
							className="w-full justify-start"
							activeProps={{
								className:
									"w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
							}}
						>
							<Plus className="w-4 h-4 mr-2" />
							New Location
						</Link>
						<Link
							to="/games/$gameId/quests/new"
							params={params}
							size="sm"
							variant="outline"
							className="w-full justify-start"
							activeProps={{
								className:
									"w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
							}}
						>
							<Plus className="w-4 h-4 mr-2" />
							New Quest
						</Link>
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

function LocationTree({ item, gameId }: { item: LocationTreeNode; gameId: string }) {
	const [isOpen, setIsOpen] = React.useState(true);

	if (!item.children?.length) {
		return (
			<SidebarMenuItem>
				<div className="relative">
					<SidebarMenuLink
						to="/games/$gameId/locations/$id"
						params={{ gameId, id: item.id }}
						className="w-full pl-6 min-w-0"
						activeProps={{
							className:
								"bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
						}}
					>
						<span className="truncate">{item.name}</span>
					</SidebarMenuLink>
					<div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center">
						<div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
					</div>
				</div>
			</SidebarMenuItem>
		);
	}

	return (
		<SidebarMenuItem>
			<Collapsible
				open={isOpen}
				onOpenChange={setIsOpen}
				className="group/collapsible"
			>
				<div className="relative">
					<SidebarMenuLink
						to="/games/$gameId/locations/$id"
						params={{ gameId, id: item.id }}
						className="w-full pl-6 min-w-0"
						activeProps={{
							className:
								"bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
						}}
					>
						<span className="truncate">{item.name}</span>
					</SidebarMenuLink>
					<CollapsibleTrigger
						render={
							<Button
								variant="ghost"
								size="icon"
								className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-sidebar-accent z-10"
							>
								<ChevronRight
									className={`h-3 w-3 transition-transform ${isOpen ? "rotate-90" : ""}`}
								/>
							</Button>
						}
					/>
				</div>
				<CollapsibleContent>
					<SidebarMenuSub className="mx-0 px-0 ml-2">
						{item.children?.map((subItem) => (
							<LocationTree
								gameId={gameId}
								key={subItem.id}
								item={subItem}
							/>
						))}
					</SidebarMenuSub>
				</CollapsibleContent>
			</Collapsible>
		</SidebarMenuItem>
	);
}

function QuestTree({ item, gameId }: { item: QuestTreeNode; gameId: string }) {
	const [isOpen, setIsOpen] = React.useState(true);

	if (!item.children?.length) {
		return (
			<SidebarMenuItem>
				<div className="relative">
					<SidebarMenuLink
						to="/games/$gameId/quests/$id"
						params={{ gameId, id: item.id }}
						className="w-full pl-6 min-w-0"
						activeProps={{
							className:
								"bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
						}}
					>
						<span className="truncate">{item.name}</span>
					</SidebarMenuLink>
					<div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center">
						<div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
					</div>
				</div>
			</SidebarMenuItem>
		);
	}

	return (
		<SidebarMenuItem>
			<Collapsible
				open={isOpen}
				onOpenChange={setIsOpen}
				className="group/collapsible"
			>
				<div className="relative">
					<SidebarMenuLink
						to="/games/$gameId/quests/$id"
						params={{ gameId, id: item.id }}
						className="w-full pl-6 min-w-0"
						activeProps={{
							className:
								"bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
						}}
					>
						<span className="truncate">{item.name}</span>
					</SidebarMenuLink>
					<CollapsibleTrigger
						render={
							<Button
								variant="ghost"
								size="icon"
								className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-sidebar-accent z-10"
							>
								<ChevronRight
									className={`h-3 w-3 transition-transform ${isOpen ? "rotate-90" : ""}`}
								/>
							</Button>
						}
					/>
				</div>
				<CollapsibleContent>
					<SidebarMenuSub className="mx-0 px-0 pl-2">
						{item.children?.map((subItem) => (
							<QuestTree gameId={gameId} key={subItem.id} item={subItem} />
						))}
					</SidebarMenuSub>
				</CollapsibleContent>
			</Collapsible>
		</SidebarMenuItem>
	);
}
