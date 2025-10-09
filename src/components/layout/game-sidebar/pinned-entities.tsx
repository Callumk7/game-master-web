import { MoreHorizontal } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPositioner,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuItem,
	SidebarMenuLink,
	useSidebar,
} from "~/components/ui/sidebar";
import { useListPinnedEntitiesSuspenseQuery } from "~/queries/quests";

interface SidebarPinnedEntitiesProps {
	gameId: string;
}

export function SidebarPinnedEntities({ gameId }: SidebarPinnedEntitiesProps) {
	const { data: pinnedEntities } = useListPinnedEntitiesSuspenseQuery(gameId);
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Pinned Entities</SidebarGroupLabel>
			<SidebarMenu>
				{pinnedEntities.data?.pinned_entities.notes?.map((item) => (
					<SidebarMenuItem key={item.id}>
						<SidebarMenuLink
							to={"/games/$gameId/notes/$id"}
							params={{ gameId, id: item.id }}
						>
							{item.name}
						</SidebarMenuLink>
						<SidebarPinnedEntitiesDropdown />
					</SidebarMenuItem>
				))}
				{pinnedEntities.data?.pinned_entities.characters?.map((item) => (
					<SidebarMenuItem key={item.id}>
						<SidebarMenuLink
							to={"/games/$gameId/characters/$id"}
							params={{ gameId, id: item.id }}
						>
							{item.name}
						</SidebarMenuLink>
						<SidebarPinnedEntitiesDropdown />
					</SidebarMenuItem>
				))}
				{pinnedEntities.data?.pinned_entities.factions?.map((item) => (
					<SidebarMenuItem key={item.id}>
						<SidebarMenuLink
							to={"/games/$gameId/factions/$id"}
							params={{ gameId, id: item.id }}
						>
							{item.name}
						</SidebarMenuLink>
						<SidebarPinnedEntitiesDropdown />
					</SidebarMenuItem>
				))}
				{pinnedEntities.data?.pinned_entities.locations?.map((item) => (
					<SidebarMenuItem key={item.id}>
						<SidebarMenuLink
							to={"/games/$gameId/locations/$id"}
							params={{ gameId, id: item.id }}
						>
							{item.name}
						</SidebarMenuLink>
						<SidebarPinnedEntitiesDropdown />
					</SidebarMenuItem>
				))}
				{pinnedEntities.data?.pinned_entities.quests?.map((item) => (
					<SidebarMenuItem key={item.id}>
						<SidebarMenuLink
							to={"/games/$gameId/quests/$id"}
							params={{ gameId, id: item.id }}
						>
							{item.name}
						</SidebarMenuLink>
						<SidebarPinnedEntitiesDropdown />
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}

function SidebarPinnedEntitiesDropdown() {
	const { isMobile } = useSidebar();
	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<SidebarMenuAction />}>
				<MoreHorizontal className="w-4 h-4" />
			</DropdownMenuTrigger>
			<DropdownMenuPositioner
				align="start"
				side={isMobile ? "bottom" : "right"}
				sideOffset={18}
				className="z-20"
			>
				<DropdownMenuContent>
					<DropdownMenuItem>Go</DropdownMenuItem>
					<DropdownMenuItem>Unpin</DropdownMenuItem>
					<DropdownMenuItem>Delete</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenuPositioner>
		</DropdownMenu>
	);
}
