import { MoreHorizontal } from "lucide-react";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuItem,
	SidebarMenuLink,
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
						<SidebarMenuAction>
							<MoreHorizontal />
						</SidebarMenuAction>
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
						<SidebarMenuAction>
							<MoreHorizontal />
						</SidebarMenuAction>
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
						<SidebarMenuAction>
							<MoreHorizontal />
						</SidebarMenuAction>
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
						<SidebarMenuAction>
							<MoreHorizontal />
						</SidebarMenuAction>
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
						<SidebarMenuAction>
							<MoreHorizontal />
						</SidebarMenuAction>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
