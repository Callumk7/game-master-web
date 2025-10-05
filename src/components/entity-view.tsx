import { Menu, Pencil, Pin, SquareArrowDownRight, Trash2 } from "lucide-react";
import { useUIActions } from "~/state/ui";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPositioner,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { EntityType } from "~/types";

type EntityTab = {
	id: string;
	label: string;
	content: React.ReactNode;
};

interface EntityViewProps {
	id: string;
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
		<div className="space-y-10 mt-2 mx-auto max-w-5xl">
			<EntityTabs tabs={tabs}>
				<EntityViewHeader
					id={id}
					type={type}
					content={content}
					content_plain_text={content_plain_text}
					name={name}
					badges={badges}
					onEdit={onEdit}
					onDelete={onDelete}
					pinned={pinned}
					onTogglePin={onTogglePin}
				/>
			</EntityTabs>
		</div>
	);
}

export function EntityViewHeader({
	id,
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
	const entity = {
		id: entityId,
		name: entityName,
		type: entityType,
		content: content,
		content_plain_text: content_plain_text,
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
					<DropdownMenuItem onClick={onEdit}>
						<Pencil />
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem onClick={onTogglePin}>
						<Pin />
						{pinned ? "Unpin" : "Pin"}
					</DropdownMenuItem>
					<DropdownMenuItem onClick={onDelete}>
						<Trash2 />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenuPositioner>
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
