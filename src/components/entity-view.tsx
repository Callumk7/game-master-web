import { Menu, Pencil, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPositioner,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type EntityTab = {
	id: string;
	label: string;
	content: React.ReactNode;
};

interface EntityViewProps {
	name: string;
	badges?: React.ReactNode;
	onEdit?: () => void;
	onDelete?: () => void;
	tabs: EntityTab[];
}

export function EntityView({ name, badges, onEdit, onDelete, tabs }: EntityViewProps) {
	return (
		<div className="space-y-10 mt-2">
			<EntityTabs tabs={tabs}>
				<EntityViewHeader
					name={name}
					badges={badges}
					onEdit={onEdit}
					onDelete={onDelete}
				/>
			</EntityTabs>
		</div>
	);
}

export function EntityViewHeader({
	name,
	badges,
	onEdit,
	onDelete,
}: Omit<EntityViewProps, "tabs">) {
	return (
		<div className="space-y-2 mb-4">
			<div className="flex items-center gap-3">
				<h1 className="text-3xl font-bold">{name}</h1>
				<EntityControls onEdit={onEdit} onDelete={onDelete} />
			</div>
			{badges && <div className="mt-1">{badges}</div>}
		</div>
	);
}

interface EntityControlsProps {
	onEdit?: () => void;
	onDelete?: () => void;
}

export function EntityControls({ onEdit, onDelete }: EntityControlsProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button size={"icon"} variant={"ghost"} />}>
				<Menu className="h-4 w-4" />
			</DropdownMenuTrigger>
			<DropdownMenuPositioner side="right" align="start" alignOffset={10}>
				<DropdownMenuContent>
					<DropdownMenuItem onClick={onEdit}>
						<Pencil />
						Edit
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
