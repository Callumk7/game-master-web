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
	File,
	Folder,
	ChevronRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
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
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuLink,
	SidebarMenuSub,
} from "~/components/ui/sidebar";
import { useGetGameLinksQuery } from "~/queries/games";
import { NavUser } from "./user-sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";

const data = {
	changes: [
		{
			file: "README.md",
			state: "M",
		},
		{
			file: "api/hello/route.ts",
			state: "U",
		},
		{
			file: "app/layout.tsx",
			state: "M",
		},
	],
	tree: [
		[
			"app",
			[
				"api",
				["hello", ["route.ts"]],
				"page.tsx",
				"layout.tsx",
				["blog", ["page.tsx"]],
			],
		],
		["components", ["ui", "button.tsx", "card.tsx"], "header.tsx", "footer.tsx"],
		["lib", ["util.ts"]],
		["public", "favicon.ico", "vercel.svg"],
		".eslintrc.json",
		".gitignore",
		"next.config.js",
		"tailwind.config.js",
		"package.json",
		"README.md",
	],
};

export function GameSidebar() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);
	const params = useParams({ from: "/_auth/games/$gameId" });

	const validGameId = params.gameId;

	const { data: links } = useGetGameLinksQuery({ id: validGameId });
	const characters = links.data?.entities?.characters;
	const factions = links.data?.entities?.factions;
	const locations = links.data?.entities?.locations;
	const notes = links.data?.entities?.notes;
	const quests = links.data?.entities?.quests;

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
				<SidebarGroup>
					<SidebarGroupLabel>Changes</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{data.changes.map((item, index) => (
								<SidebarMenuItem key={index}>
									<SidebarMenuButton>
										<File />
										{item.file}
									</SidebarMenuButton>
									<SidebarMenuBadge>{item.state}</SidebarMenuBadge>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Files</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{data.tree.map((item, index) => (
								<Tree key={index} item={item} />
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
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
							>
								<Users className="w-4 h-4" />
								Characters
								<Badge variant="secondary" className="ml-auto">
									{characters?.length.toString() || "0"}
								</Badge>
							</SidebarMenuLink>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuLink to="/games/$gameId/factions" params={params}>
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
							>
								<MapPin className="w-4 h-4" />
								Locations
								<Badge variant="secondary" className="ml-auto">
									{locations?.length.toString() || "0"}
								</Badge>
							</SidebarMenuLink>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuLink to="/games/$gameId/quests" params={params}>
								<Gem className="w-4 h-4" />
								Quests
								<Badge variant="secondary" className="ml-auto">
									{quests?.length.toString() || "0"}
								</Badge>
							</SidebarMenuLink>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuLink to="/games/$gameId/notes" params={params}>
								<Scroll className="w-4 h-4" />
								Notes
								<Badge variant="secondary" className="ml-auto">
									{notes?.length.toString() || "0"}
								</Badge>
							</SidebarMenuLink>
						</SidebarMenuItem>
					</SidebarMenu>

					<div className="mt-4 space-y-2">
						<Link
							to="/games/$gameId/notes/new"
							params={params}
							size="sm"
							variant="outline"
							className="w-full justify-start"
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

function Tree({ item }: { item: string | any[] }) {
	const [name, ...items] = Array.isArray(item) ? item : [item];

	if (!items.length) {
		return (
			<SidebarMenuButton
				isActive={name === "button.tsx"}
				className="data-[active=true]:bg-transparent"
			>
				<File />
				{name}
			</SidebarMenuButton>
		);
	}

	return (
		<SidebarMenuItem>
			<Collapsible
				className="group/collapsible [&[data-open]>button>svg:first-child]:rotate-90"
				defaultOpen={name === "components" || name === "ui"}
			>
				<CollapsibleTrigger
					render={
						<SidebarMenuButton>
							<ChevronRight className="transition-transform" />
							<Folder />
							{name}
						</SidebarMenuButton>
					}
				></CollapsibleTrigger>
				<CollapsibleContent>
					<SidebarMenuSub>
						{items.map((subItem, index) => (
							<Tree key={index} item={subItem} />
						))}
					</SidebarMenuSub>
				</CollapsibleContent>
			</Collapsible>
		</SidebarMenuItem>
	);
}
