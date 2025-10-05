import * as React from "react";
import { Search, Users, MapPin, ScrollText, Sword, Target } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
	useListCharactersQuery,
	useListFactionsQuery,
	useListLocationsQuery,
	useListNotesQuery,
	useListQuestsQuery,
} from "~/api/@tanstack/react-query.gen";

interface EntitySelectorProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	gameId: string;
	onSelect: (entityPath: string) => void;
	title?: string;
}

export function EntitySelector({
	isOpen,
	onOpenChange,
	gameId,
	onSelect,
	title = "Select Entity",
}: EntitySelectorProps) {
	const [searchQuery, setSearchQuery] = React.useState("");

	// Fetch all entity types
	const { data: charactersData } = useListCharactersQuery({
		path: { game_id: gameId },
	}, { enabled: isOpen });

	const { data: factionsData } = useListFactionsQuery({
		path: { game_id: gameId },
	}, { enabled: isOpen });

	const { data: locationsData } = useListLocationsQuery({
		path: { game_id: gameId },
	}, { enabled: isOpen });

	const { data: notesData } = useListNotesQuery({
		path: { game_id: gameId },
	}, { enabled: isOpen });

	const { data: questsData } = useListQuestsQuery({
		path: { game_id: gameId },
	}, { enabled: isOpen });

	const characters = charactersData?.data || [];
	const factions = factionsData?.data || [];
	const locations = locationsData?.data || [];
	const notes = notesData?.data || [];
	const quests = questsData?.data || [];

	// Filter entities based on search query
	const filteredCharacters = React.useMemo(() => 
		characters.filter((c: any) => 
			c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			c.class?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			c.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
		), [characters, searchQuery]);

	const filteredFactions = React.useMemo(() => 
		factions.filter((f: any) => 
			f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			f.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
		), [factions, searchQuery]);

	const filteredLocations = React.useMemo(() => 
		locations.filter((l: any) => 
			l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			l.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
		), [locations, searchQuery]);

	const filteredNotes = React.useMemo(() => 
		notes.filter((n: any) => 
			n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			n.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
		), [notes, searchQuery]);

	const filteredQuests = React.useMemo(() => 
		quests.filter((q: any) => 
			q.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			q.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
		), [quests, searchQuery]);

	// Reset search when dialog closes
	React.useEffect(() => {
		if (!isOpen) {
			setSearchQuery("");
		}
	}, [isOpen]);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[80vh]">
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
					<TabsList className="grid w-full grid-cols-5">
						<TabsTrigger value="characters" className="flex items-center gap-1">
							<Users className="h-3 w-3" />
							Characters
							<Badge variant="secondary" className="ml-1 text-xs">
								{filteredCharacters.length}
							</Badge>
						</TabsTrigger>
						<TabsTrigger value="factions" className="flex items-center gap-1">
							<Sword className="h-3 w-3" />
							Factions
							<Badge variant="secondary" className="ml-1 text-xs">
								{filteredFactions.length}
							</Badge>
						</TabsTrigger>
						<TabsTrigger value="locations" className="flex items-center gap-1">
							<MapPin className="h-3 w-3" />
							Locations
							<Badge variant="secondary" className="ml-1 text-xs">
								{filteredLocations.length}
							</Badge>
						</TabsTrigger>
						<TabsTrigger value="notes" className="flex items-center gap-1">
							<ScrollText className="h-3 w-3" />
							Notes
							<Badge variant="secondary" className="ml-1 text-xs">
								{filteredNotes.length}
							</Badge>
						</TabsTrigger>
						<TabsTrigger value="quests" className="flex items-center gap-1">
							<Target className="h-3 w-3" />
							Quests
							<Badge variant="secondary" className="ml-1 text-xs">
								{filteredQuests.length}
							</Badge>
						</TabsTrigger>
					</TabsList>

					<div className="mt-4 overflow-auto max-h-[400px]">
						<TabsContent value="characters" className="space-y-2">
							{filteredCharacters.map((character: any) => (
								<EntityItem
									key={character.id}
									entity={character}
									entityType="characters"
									onSelect={onSelect}
								/>
							))}
							{filteredCharacters.length === 0 && (
								<EmptyState type="characters" hasSearchQuery={!!searchQuery} />
							)}
						</TabsContent>

						<TabsContent value="factions" className="space-y-2">
							{filteredFactions.map((faction: any) => (
								<EntityItem
									key={faction.id}
									entity={faction}
									entityType="factions"
									onSelect={onSelect}
								/>
							))}
							{filteredFactions.length === 0 && (
								<EmptyState type="factions" hasSearchQuery={!!searchQuery} />
							)}
						</TabsContent>

						<TabsContent value="locations" className="space-y-2">
							{filteredLocations.map((location: any) => (
								<EntityItem
									key={location.id}
									entity={location}
									entityType="locations"
									onSelect={onSelect}
								/>
							))}
							{filteredLocations.length === 0 && (
								<EmptyState type="locations" hasSearchQuery={!!searchQuery} />
							)}
						</TabsContent>

						<TabsContent value="notes" className="space-y-2">
							{filteredNotes.map((note: any) => (
								<EntityItem
									key={note.id}
									entity={note}
									entityType="notes"
									onSelect={onSelect}
								/>
							))}
							{filteredNotes.length === 0 && (
								<EmptyState type="notes" hasSearchQuery={!!searchQuery} />
							)}
						</TabsContent>

						<TabsContent value="quests" className="space-y-2">
							{filteredQuests.map((quest: any) => (
								<EntityItem
									key={quest.id}
									entity={quest}
									entityType="quests"
									onSelect={onSelect}
								/>
							))}
							{filteredQuests.length === 0 && (
								<EmptyState type="quests" hasSearchQuery={!!searchQuery} />
							)}
						</TabsContent>
					</div>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}

interface EntityItemProps {
	entity: {
		id: string;
		name: string;
		tags?: string[];
		class?: string;
		level?: number;
	};
	entityType: string;
	onSelect: (entityPath: string) => void;
}

function EntityItem({ entity, entityType, onSelect }: EntityItemProps) {
	const handleSelect = () => {
		onSelect(`${entityType}/${entity.id}`);
	};

	return (
		<Button
			variant="ghost"
			className="w-full justify-start h-auto p-3 text-left"
			onClick={handleSelect}
		>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1">
					<span className="font-medium truncate">{entity.name}</span>
					{entity.class && (
						<Badge variant="outline" className="text-xs">
							{entity.class}
						</Badge>
					)}
					{entity.level && (
						<Badge variant="outline" className="text-xs">
							Level {entity.level}
						</Badge>
					)}
				</div>
				{entity.tags && entity.tags.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{entity.tags.slice(0, 3).map((tag) => (
							<Badge key={tag} variant="secondary" className="text-xs">
								{tag}
							</Badge>
						))}
						{entity.tags.length > 3 && (
							<Badge variant="secondary" className="text-xs">
								+{entity.tags.length - 3} more
							</Badge>
						)}
					</div>
				)}
			</div>
		</Button>
	);
}

interface EmptyStateProps {
	type: string;
	hasSearchQuery: boolean;
}

function EmptyState({ type, hasSearchQuery }: EmptyStateProps) {
	if (hasSearchQuery) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				<p>No {type} found matching your search.</p>
			</div>
		);
	}

	return (
		<div className="text-center py-8 text-muted-foreground">
			<p>No {type} available in this game.</p>
		</div>
	);
}