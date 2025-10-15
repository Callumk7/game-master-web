import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	ArrowRight,
	Gem,
	MapPin,
	MoreHorizontal,
	Pin,
	Scroll,
	Shield,
	Trash2,
	User,
} from "lucide-react";
import {
	listGameEntitiesQueryKey,
	listPinnedEntitiesQueryKey,
} from "~/api/@tanstack/react-query.gen";
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
import { getEntityQueryKey, useDeleteEntity, useUpdateEntity } from "~/queries/utils";
import type { EntityType } from "~/types";

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
							<Scroll />
							{item.name}
						</SidebarMenuLink>
						<SidebarPinnedEntitiesDropdown
							gameId={gameId}
							pinnedEntityId={item.id}
							pinnedEntityType="note"
							isPinned={item.pinned}
						/>
					</SidebarMenuItem>
				))}
				{pinnedEntities.data?.pinned_entities.characters?.map((item) => (
					<SidebarMenuItem key={item.id} className="min-w-0">
						<SidebarMenuLink
							to={"/games/$gameId/characters/$id"}
							params={{ gameId, id: item.id }}
						>
							<User />
							<span className="truncate pr-6">{item.name}</span>
						</SidebarMenuLink>
						<SidebarPinnedEntitiesDropdown
							gameId={gameId}
							pinnedEntityId={item.id}
							pinnedEntityType="character"
							isPinned={item.pinned}
						/>
					</SidebarMenuItem>
				))}
				{pinnedEntities.data?.pinned_entities.factions?.map((item) => (
					<SidebarMenuItem key={item.id} className="min-w-0">
						<SidebarMenuLink
							to={"/games/$gameId/factions/$id"}
							params={{ gameId, id: item.id }}
						>
							<Shield />
							<span className="truncate pr-6">{item.name}</span>
						</SidebarMenuLink>
						<SidebarPinnedEntitiesDropdown
							gameId={gameId}
							pinnedEntityId={item.id}
							pinnedEntityType="faction"
							isPinned={item.pinned}
						/>
					</SidebarMenuItem>
				))}
				{pinnedEntities.data?.pinned_entities.locations?.map((item) => (
					<SidebarMenuItem key={item.id} className="min-w-0">
						<SidebarMenuLink
							to={"/games/$gameId/locations/$id"}
							params={{ gameId, id: item.id }}
						>
							<MapPin />
							<span className="truncate pr-6">{item.name}</span>
						</SidebarMenuLink>
						<SidebarPinnedEntitiesDropdown
							gameId={gameId}
							pinnedEntityId={item.id}
							pinnedEntityType="location"
							isPinned={item.pinned}
						/>
					</SidebarMenuItem>
				))}
				{pinnedEntities.data?.pinned_entities.quests?.map((item) => (
					<SidebarMenuItem key={item.id} className="min-w-0">
						<SidebarMenuLink
							to={"/games/$gameId/quests/$id"}
							params={{ gameId, id: item.id }}
						>
							<Gem />
							<span className="truncate pr-6">{item.name}</span>
						</SidebarMenuLink>
						<SidebarPinnedEntitiesDropdown
							gameId={gameId}
							pinnedEntityId={item.id}
							pinnedEntityType="quest"
							isPinned={item.pinned}
						/>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}

interface SidebarPinnedEntitiesDropdownProps {
	gameId: string;
	pinnedEntityId: string;
	pinnedEntityType: EntityType;
	isPinned: boolean;
}
function SidebarPinnedEntitiesDropdown({
	gameId,
	pinnedEntityId,
	pinnedEntityType,
	isPinned,
}: SidebarPinnedEntitiesDropdownProps) {
	const { isMobile } = useSidebar();
	const navigate = useNavigate();
	const client = useQueryClient();

	const { mutate } = useUpdateEntity(() => {
		client.invalidateQueries({
			queryKey: listPinnedEntitiesQueryKey({ path: { game_id: gameId } }),
		});
		client.invalidateQueries({
			queryKey: getEntityQueryKey(
				{ entityId: pinnedEntityId, entityType: pinnedEntityType },
				gameId,
			),
		});
	});
	const handleTogglePin = async () => {
		mutate({
			gameId,
			entityType: pinnedEntityType,
			entityId: pinnedEntityId,
			payload: { pinned: !isPinned },
		});
	};

	const { mutate: deleteMutate } = useDeleteEntity(() => {
		client.refetchQueries({
			queryKey: listGameEntitiesQueryKey({ path: { game_id: gameId } }),
		});
		client.refetchQueries({
			queryKey: listPinnedEntitiesQueryKey({ path: { game_id: gameId } }),
		});
	});
	const handleDelete = () => {
		deleteMutate({
			gameId,
			entityId: pinnedEntityId,
			entityType: pinnedEntityType,
		});
	};

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
					<DropdownMenuItem
						onClick={() =>
							navigate({
								to: `/games/${gameId}/${pinnedEntityType}s/${pinnedEntityId}`,
							})
						}
					>
						<ArrowRight className="mr-1" />
						Go
					</DropdownMenuItem>
					<DropdownMenuItem onClick={handleTogglePin}>
						<Pin className="mr-1" />
						Unpin
					</DropdownMenuItem>
					<DropdownMenuItem onClick={handleDelete}>
						<Trash2 className="mr-1" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenuPositioner>
		</DropdownMenu>
	);
}
