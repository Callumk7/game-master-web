import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	ArrowRight,
	Gem,
	MapPin,
	MoreHorizontal,
	Pencil,
	Pin,
	Scroll,
	Shield,
	SquareArrowDownRight,
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
import { DeleteConfirmationDialog } from "~/components/ui/delete-confirmation-dialog";
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
import { useHandleEditEntity, useUIActions } from "~/state/ui";
import type { Entity, EntityType } from "~/types";
import { pluralise } from "~/utils/pluralise";

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
							activeProps={{
								className:
									"bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
							}}
						>
							<Scroll />
							<span className="truncate pr-6">{item.name}</span>
						</SidebarMenuLink>
						<SidebarPinnedEntitiesDropdown
							gameId={gameId}
							entity={item}
							entityType="note"
						/>
					</SidebarMenuItem>
				))}
				{pinnedEntities.data?.pinned_entities.characters?.map((item) => (
					<SidebarMenuItem key={item.id} className="min-w-0">
						<SidebarMenuLink
							to={"/games/$gameId/characters/$id"}
							params={{ gameId, id: item.id }}
							activeProps={{
								className:
									"bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
							}}
						>
							<User />
							<span className="truncate pr-6">{item.name}</span>
						</SidebarMenuLink>
						<SidebarPinnedEntitiesDropdown
							gameId={gameId}
							entity={item}
							entityType="character"
						/>
					</SidebarMenuItem>
				))}
				{pinnedEntities.data?.pinned_entities.factions?.map((item) => (
					<SidebarMenuItem key={item.id} className="min-w-0">
						<SidebarMenuLink
							to={"/games/$gameId/factions/$id"}
							params={{ gameId, id: item.id }}
							activeProps={{
								className:
									"bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
							}}
						>
							<Shield />
							<span className="truncate pr-6">{item.name}</span>
						</SidebarMenuLink>
						<SidebarPinnedEntitiesDropdown
							gameId={gameId}
							entity={item}
							entityType="faction"
						/>
					</SidebarMenuItem>
				))}
				{pinnedEntities.data?.pinned_entities.locations?.map((item) => (
					<SidebarMenuItem key={item.id} className="min-w-0">
						<SidebarMenuLink
							to={"/games/$gameId/locations/$id"}
							params={{ gameId, id: item.id }}
							activeProps={{
								className:
									"bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
							}}
						>
							<MapPin />
							<span className="truncate pr-6">{item.name}</span>
						</SidebarMenuLink>
						<SidebarPinnedEntitiesDropdown
							gameId={gameId}
							entity={item}
							entityType="location"
						/>
					</SidebarMenuItem>
				))}
				{pinnedEntities.data?.pinned_entities.quests?.map((item) => (
					<SidebarMenuItem key={item.id} className="min-w-0">
						<SidebarMenuLink
							to={"/games/$gameId/quests/$id"}
							params={{ gameId, id: item.id }}
							activeProps={{
								className:
									"bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
							}}
						>
							<Gem />
							<span className="truncate pr-6">{item.name}</span>
						</SidebarMenuLink>
						<SidebarPinnedEntitiesDropdown
							gameId={gameId}
							entity={item}
							entityType="quest"
						/>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}

interface SidebarPinnedEntitiesDropdownProps {
	gameId: string;
	entity: Entity;
	entityType: EntityType;
}
function SidebarPinnedEntitiesDropdown({
	gameId,
	entity,
	entityType,
}: SidebarPinnedEntitiesDropdownProps) {
	const { isMobile } = useSidebar();
	const navigate = useNavigate();
	const client = useQueryClient();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

	const handleEdit = useHandleEditEntity(entity.id, entityType);

	const { mutate } = useUpdateEntity(() => {
		client.invalidateQueries({
			queryKey: listPinnedEntitiesQueryKey({ path: { game_id: gameId } }),
		});
		client.invalidateQueries({
			queryKey: getEntityQueryKey(
				{ entityId: entity.id, entityType: entityType },
				gameId,
			),
		});
	});
	const handleTogglePin = async () => {
		mutate({
			gameId,
			entityType: entityType,
			entityId: entity.id,
			payload: { pinned: !entity.pinned },
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
			entityId: entity.id,
			entityType: entityType,
		});
	};

	const handleDeleteConfirm = () => {
		handleDelete();
	};

	const { openEntityWindow } = useUIActions();

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
								to: `/games/${gameId}/${pluralise(entityType)}/${entity.id}`,
							})
						}
					>
						<ArrowRight className="mr-1" />
						Go
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => {
							openEntityWindow({ ...entity, type: entityType });
						}}
					>
						<SquareArrowDownRight className="mr-1" />
						Popout
					</DropdownMenuItem>
					<DropdownMenuItem onClick={handleTogglePin}>
						<Pin className="mr-1" />
						Unpin
					</DropdownMenuItem>
					<DropdownMenuItem onClick={handleEdit}>
						<Pencil className="mr-1" />
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
						<Trash2 className="mr-1" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenuPositioner>
			<DeleteConfirmationDialog
				isOpen={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
				onConfirm={handleDeleteConfirm}
				entityName={entity.name}
				entityType={entityType}
			/>
		</DropdownMenu>
	);
}
