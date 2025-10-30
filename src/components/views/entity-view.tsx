import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	Menu,
	Pencil,
	Pin,
	SplitSquareHorizontal,
	SquareArrowDownRight,
	Trash2,
} from "lucide-react";
import { getEntityPrimaryImageOptions } from "~/api/@tanstack/react-query.gen";
import { Badge } from "~/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPositioner,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useSplitViewLeftPane, useSplitViewRightPane, useUIActions } from "~/state/ui";
import type { EntityType } from "~/types";
import { PrimaryImageBanner } from "../images/primary-image-banner";
import { Button } from "../ui/button";
import { DeleteConfirmationDialog } from "../ui/delete-confirmation-dialog";

type EntityTab = {
	id: string;
	label: string;
	content: React.ReactNode;
};

interface EntityViewProps {
	id: string;
	gameId: string;
	type: EntityType;
	name: string;
	content?: string;
	content_plain_text?: string;
	badges?: React.ReactNode;
	onEdit?: () => void;
	onDelete?: () => void;
	pinned?: boolean;
	onTogglePin?: () => void;
	tabs: EntityTab[];
}

export function EntityView({
	id,
	gameId,
	type,
	content,
	content_plain_text,
	name,
	badges,
	onEdit,
	onDelete,
	pinned,
	onTogglePin,
	tabs,
}: EntityViewProps) {
	return (
		<div className="space-y-10">
			<EntityTabs tabs={tabs}>
				<EntityViewHeader
					id={id}
					gameId={gameId}
					type={type}
					content={content}
					content_plain_text={content_plain_text}
					name={name}
					badges={badges}
					pinned={pinned}
					onEdit={onEdit}
					onDelete={onDelete}
					onTogglePin={onTogglePin}
				/>
			</EntityTabs>
		</div>
	);
}

export function EntityViewHeader({
	id,
	gameId,
	type,
	content,
	content_plain_text,
	name,
	badges,
	onEdit,
	onDelete,
	pinned,
	onTogglePin,
}: Omit<EntityViewProps, "tabs">) {
	const { data: primaryImageData } = useQuery({
		...getEntityPrimaryImageOptions({
			path: { game_id: gameId, entity_id: id, entity_type: type },
		}),
		retry: false,
	});

	const primaryImage = primaryImageData?.data;
	return (
		<div className="space-y-2 mb-4">
			<div className="flex items-center gap-3">
				<h1 className="text-3xl font-bold">{name}</h1>
				<EntityControls
					entityId={id}
					entityName={name}
					entityType={type}
					content={content}
					content_plain_text={content_plain_text}
					onEdit={onEdit}
					onDelete={onDelete}
					pinned={pinned}
					onTogglePin={onTogglePin}
				/>
			</div>
			{badges && <div className="mt-1">{badges}</div>}
			{pinned && <Badge>Pinned</Badge>}
			{primaryImage && <PrimaryImageBanner gameId={gameId} image={primaryImage} />}
		</div>
	);
}

interface EntityControlsProps {
	entityId: string;
	entityName: string;
	entityType: EntityType;
	content?: string;
	content_plain_text?: string;
	onEdit?: () => void;
	onDelete?: () => void;
	pinned?: boolean;
	onTogglePin?: () => void;
}

export function EntityControls({
	entityId,
	entityName,
	entityType,
	content,
	content_plain_text,
	onEdit,
	onDelete,
	pinned,
	onTogglePin,
}: EntityControlsProps) {
	const { openEntityWindow } = useUIActions();
	const navigate = useNavigate();
	const { updateSplitViewPanes } = useUIActions();
	const leftPane = useSplitViewLeftPane();
	const rightPane = useSplitViewRightPane();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

	const entity = {
		id: entityId,
		name: entityName,
		type: entityType,
		content: content,
		content_plain_text: content_plain_text,
	};

	const openInSplitView = () => {
		// Extract gameId from current URL path
		// TODO: Probably use tanstack router params for this instead
		const gameId = window.location.pathname.split("/")[2];

		const newPane = {
			type: entityType,
			id: entityId,
		};

		const arrangePanes = () => {
			if (!leftPane) {
				updateSplitViewPanes(newPane, rightPane);
			} else {
				updateSplitViewPanes(leftPane, newPane);
			}
		};

		arrangePanes();

		navigate({
			to: "/games/$gameId/split",
			params: { gameId },
		});
	};

	const handleDeleteConfirm = () => {
		if (onDelete) {
			onDelete();
			setIsDeleteDialogOpen(false);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button size={"icon"} variant={"ghost"} />}>
				<Menu className="h-4 w-4" />
			</DropdownMenuTrigger>
			<DropdownMenuPositioner side="right" align="start" alignOffset={10}>
				<DropdownMenuContent>
					<DropdownMenuItem onClick={() => openEntityWindow(entity)}>
						<SquareArrowDownRight />
						Popout
					</DropdownMenuItem>
					<DropdownMenuItem onClick={openInSplitView}>
						<SplitSquareHorizontal />
						Split View
					</DropdownMenuItem>
					<DropdownMenuItem onClick={onEdit}>
						<Pencil />
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem onClick={onTogglePin}>
						<Pin />
						{pinned ? "Unpin" : "Pin"}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
						<Trash2 />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenuPositioner>
			<DeleteConfirmationDialog
				isOpen={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
				onConfirm={handleDeleteConfirm}
				entityName={entityName}
				entityType={entityType}
			/>
		</DropdownMenu>
	);
}

interface EntityTabsProps {
	tabs: EntityTab[];
	children: React.ReactNode;
}

export function EntityTabs({ tabs, children }: EntityTabsProps) {
	if (!tabs.length) {
		return null;
	}

	return (
		<Tabs defaultValue={tabs[0].id}>
			<TabsList className="mb-6">
				{tabs.map((tab) => (
					<TabsTrigger key={tab.id} value={tab.id}>
						{tab.label}
					</TabsTrigger>
				))}
			</TabsList>
			{children}
			{tabs.map((tab) => (
				<TabsContent key={tab.id} value={tab.id}>
					{tab.content}
				</TabsContent>
			))}
		</Tabs>
	);
}
