import { MapPin, ScrollText, Search, Sword, Target, Users } from "lucide-react";
import type { Character } from "~/api/types.gen";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { Entity, EntityType } from "~/types";
import type { EntityPath } from "~/types/split-view";
import { useEntitySelector } from "./hooks";

// Type guards for entity types
function isCharacter(entity: Entity): entity is Character {
	return "class" in entity || "level" in entity;
}

interface EntitySelectorModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	gameId: string;
	onSelect: (entityPath: EntityPath) => void;
	title?: string;
}

export function EntitySelectorModal({
	isOpen,
	onOpenChange,
	gameId,
	onSelect,
	title = "Select Entity",
}: EntitySelectorModalProps) {
	const { searchQuery, setSearchQuery, filteredEntities } = useEntitySelector({
		gameId,
		isOpen,
	});

	const handleEntitySelect = (entityType: EntityType, entityId: string) => {
		onSelect({ type: entityType, id: entityId });
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-5xl w-[95vw] max-h-[85vh]">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>
						Choose an entity to display in the split view pane.
					</DialogDescription>
				</DialogHeader>

				{/* Search Input */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search entities..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>

				{/* Entity Tabs */}
				<Tabs defaultValue="characters" className="flex-1 overflow-hidden">
					<TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1 h-auto p-1">
						<EntityTab
							value="characters"
							icon={<Users className="h-3 w-3 flex-shrink-0" />}
							label="Characters"
							shortLabel="Char"
							count={filteredEntities.characters.length}
						/>
						<EntityTab
							value="factions"
							icon={<Sword className="h-3 w-3 flex-shrink-0" />}
							label="Factions"
							shortLabel="Fact"
							count={filteredEntities.factions.length}
						/>
						<EntityTab
							value="locations"
							icon={<MapPin className="h-3 w-3 flex-shrink-0" />}
							label="Locations"
							shortLabel="Loc"
							count={filteredEntities.locations.length}
						/>
						<EntityTab
							value="notes"
							icon={<ScrollText className="h-3 w-3 flex-shrink-0" />}
							label="Notes"
							shortLabel="Note"
							count={filteredEntities.notes.length}
						/>
						<EntityTab
							value="quests"
							icon={<Target className="h-3 w-3 flex-shrink-0" />}
							label="Quests"
							shortLabel="Quest"
							count={filteredEntities.quests.length}
						/>
					</TabsList>

					<div className="mt-4 overflow-auto max-h-[400px] border border-border rounded-md">
						<EntityTabContent
							value="characters"
							entities={filteredEntities.characters}
							entityType="character"
							onSelect={handleEntitySelect}
							hasSearchQuery={!!searchQuery}
						/>
						<EntityTabContent
							value="factions"
							entities={filteredEntities.factions}
							entityType="faction"
							onSelect={handleEntitySelect}
							hasSearchQuery={!!searchQuery}
						/>
						<EntityTabContent
							value="locations"
							entities={filteredEntities.locations}
							entityType="location"
							onSelect={handleEntitySelect}
							hasSearchQuery={!!searchQuery}
						/>
						<EntityTabContent
							value="notes"
							entities={filteredEntities.notes}
							entityType="note"
							onSelect={handleEntitySelect}
							hasSearchQuery={!!searchQuery}
						/>
						<EntityTabContent
							value="quests"
							entities={filteredEntities.quests}
							entityType="quest"
							onSelect={handleEntitySelect}
							hasSearchQuery={!!searchQuery}
						/>
					</div>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}

interface EntityTabProps {
	value: string;
	icon: React.ReactNode;
	label: string;
	shortLabel: string;
	count: number;
}

function EntityTab({ value, icon, label, shortLabel, count }: EntityTabProps) {
	return (
		<TabsTrigger
			value={value}
			className="flex items-center justify-center gap-1 text-xs sm:text-sm min-w-0 px-2 py-1.5"
		>
			{icon}
			<span className="hidden md:inline truncate">{label}</span>
			<span className="md:hidden truncate">{shortLabel}</span>
			<Badge variant="secondary" className="text-xs ml-1">
				{count}
			</Badge>
		</TabsTrigger>
	);
}

interface EntityTabContentProps {
	value: string;
	entities: Entity[];
	entityType: EntityType;
	onSelect: (entityType: EntityType, entityId: string) => void;
	hasSearchQuery: boolean;
}

function EntityTabContent({
	value,
	entities,
	entityType,
	onSelect,
	hasSearchQuery,
}: EntityTabContentProps) {
	return (
		<TabsContent value={value} className="space-y-0">
			{entities.map((entity) => (
				<EntityItem
					key={entity.id}
					entity={entity}
					entityType={entityType}
					onSelect={onSelect}
				/>
			))}
			{entities.length === 0 && (
				<EmptyState type={entityType} hasSearchQuery={hasSearchQuery} />
			)}
		</TabsContent>
	);
}

interface EntityItemProps {
	entity: Entity;
	entityType: EntityType;
	onSelect: (entityType: EntityType, entityId: string) => void;
}

function EntityItem({ entity, entityType, onSelect }: EntityItemProps) {
	const handleSelect = () => {
		onSelect(entityType, entity.id);
	};

	return (
		<div className="border-b border-border/40 last:border-b-0">
			<Button
				variant="ghost"
				className="w-full justify-start h-auto p-4 text-left hover:bg-muted/50 rounded-none"
				onClick={handleSelect}
			>
				<div className="flex-1 min-w-0 space-y-2">
					{/* Entity name and primary info */}
					<div className="flex items-center justify-between gap-3">
						<span className="font-medium truncate text-base">
							{entity.name}
						</span>
						<div className="flex items-center gap-2 flex-shrink-0">
							{isCharacter(entity) && entity.class && (
								<Badge variant="outline" className="text-xs">
									{entity.class}
								</Badge>
							)}
							{isCharacter(entity) && entity.level && (
								<Badge variant="outline" className="text-xs">
									Level {entity.level}
								</Badge>
							)}
						</div>
					</div>

					{/* Tags row */}
					{entity.tags && entity.tags.length > 0 && (
						<div className="flex flex-wrap gap-1.5">
							{entity.tags.slice(0, 4).map((tag) => (
								<Badge key={tag} variant="secondary" className="text-xs">
									{tag}
								</Badge>
							))}
							{entity.tags.length > 4 && (
								<Badge variant="secondary" className="text-xs">
									+{entity.tags.length - 4} more
								</Badge>
							)}
						</div>
					)}
				</div>
			</Button>
		</div>
	);
}

interface EmptyStateProps {
	type: EntityType;
	hasSearchQuery: boolean;
}

function EmptyState({ type, hasSearchQuery }: EmptyStateProps) {
	if (hasSearchQuery) {
		return (
			<div className="text-center py-12 px-4 text-muted-foreground border-b border-border/40 last:border-b-0">
				<p>No {type} found matching your search.</p>
			</div>
		);
	}

	return (
		<div className="text-center py-12 px-4 text-muted-foreground border-b border-border/40 last:border-b-0">
			<p>No {type} available in this game.</p>
		</div>
	);
}
