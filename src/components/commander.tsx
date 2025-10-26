import { useNavigate } from "@tanstack/react-router";
import {
	CheckSquare,
	FileText,
	Gem,
	MapPin,
	Plus,
	Search,
	Shield,
	Sword,
	User,
	Users,
} from "lucide-react";
import * as React from "react";
import { useListPinnedEntitiesQuery } from "~/api/@tanstack/react-query.gen";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "~/components/ui/command";
import {
	createPlatformShiftShortcut,
	createPlatformShortcut,
	useKeyboardShortcut,
} from "~/hooks/useKeyboardShortcut";
import { useGetGameLinksData } from "~/queries/utils";
import { useIsCommanderOpen, useUIActions } from "~/state/ui";
import type { EntityType } from "~/types";
import { Badge } from "./ui/badge";

export function Commander({ gameId }: { gameId: string }) {
	const navigate = useNavigate();

	const { characters, factions, locations, notes, quests, isLoading } =
		useGetGameLinksData(gameId);

	const { data: pinnedEntitiesResponse, isLoading: pinnedLoading } =
		useListPinnedEntitiesQuery({
			path: { game_id: gameId },
		});

	const {
		setIsCommanderOpen,
		setIsCreateCharacterOpen,
		setIsCreateFactionOpen,
		setIsCreateNoteOpen,
		setIsCreateLocationOpen,
		setIsCreateQuestOpen,
		setIsTodoDrawerOpen,
		openEntityWindow,
	} = useUIActions();
	const isCommanderOpen = useIsCommanderOpen();
	const modifierKeyPressed = React.useRef(false);

	const handleEntitySelect = React.useCallback(
		(entity: { id: string; name: string; type: EntityType; content?: string }) => {
			if (modifierKeyPressed.current) {
				setIsCommanderOpen(false);
				openEntityWindow({
					id: entity.id,
					name: entity.name,
					type: entity.type,
					content: entity.content,
				});
			} else {
				setIsCommanderOpen(false);
				navigate({
					to: `/games/$gameId/${entity.type}s/$id`,
					params: { gameId, id: entity.id },
				});
			}
		},
		[gameId, navigate, setIsCommanderOpen, openEntityWindow],
	);

	// Track modifier keys globally when commander is open
	React.useEffect(() => {
		if (!isCommanderOpen) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.metaKey || event.ctrlKey) {
				modifierKeyPressed.current = true;
			}
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			if (!event.metaKey && !event.ctrlKey) {
				modifierKeyPressed.current = false;
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("keyup", handleKeyUp);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("keyup", handleKeyUp);
			modifierKeyPressed.current = false;
		};
	}, [isCommanderOpen]);

	// Set up keyboard shortcuts
	const shortcuts = React.useMemo(
		() => [
			// Global shortcut to toggle commander
			createPlatformShortcut(
				"k",
				() => {
					setIsCommanderOpen(!isCommanderOpen);
				},
				{ allowInInputs: true },
			),
			// Commander-specific shortcuts (Cmd+Shift to avoid browser conflicts)
			createPlatformShiftShortcut(
				"c",
				() => {
					setIsCommanderOpen(false);
					setIsCreateCharacterOpen(true);
				},
				{ scope: () => isCommanderOpen, allowInInputs: true },
			),
			createPlatformShiftShortcut(
				"f",
				() => {
					setIsCommanderOpen(false);
					setIsCreateFactionOpen(true);
				},
				{ scope: () => isCommanderOpen, allowInInputs: true },
			),
			createPlatformShiftShortcut(
				"l",
				() => {
					setIsCommanderOpen(false);
					setIsCreateLocationOpen(true);
				},
				{ scope: () => isCommanderOpen, allowInInputs: true },
			),
			createPlatformShiftShortcut(
				"n",
				() => {
					setIsCommanderOpen(false);
					setIsCreateNoteOpen(true);
				},
				{ scope: () => isCommanderOpen, allowInInputs: true },
			),
			createPlatformShiftShortcut(
				"q",
				() => {
					setIsCommanderOpen(false);
					setIsCreateQuestOpen(true);
				},
				{ scope: () => isCommanderOpen, allowInInputs: true },
			),
			createPlatformShiftShortcut(
				"t",
				() => {
					setIsCommanderOpen(false);
					setIsTodoDrawerOpen(true);
				},
				{ scope: () => isCommanderOpen, allowInInputs: true },
			),
		],
		[
			isCommanderOpen,
			setIsCommanderOpen,
			setIsCreateCharacterOpen,
			setIsCreateFactionOpen,
			setIsCreateLocationOpen,
			setIsCreateNoteOpen,
			setIsCreateQuestOpen,
			setIsTodoDrawerOpen,
		],
	);

	useKeyboardShortcut(shortcuts);

	return (
		<CommandDialog open={isCommanderOpen} onOpenChange={setIsCommanderOpen}>
			<CommandInput placeholder="Type a command or search..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				{isLoading ? (
					<CommandGroup heading="Loading...">
						<CommandItem disabled>
							<span>Loading entities...</span>
						</CommandItem>
					</CommandGroup>
				) : (
					<>
						<CommandGroup heading="Pinned">
							{pinnedLoading ? (
								<CommandItem disabled>
									<span>Loading pinned entities...</span>
								</CommandItem>
							) : (
								<>
									{pinnedEntitiesResponse?.data?.pinned_entities.notes?.map(
										(item) => (
											<CommandItem
												key={item.id}
												onSelect={() =>
													handleEntitySelect({
														id: item.id,
														name: item.name,
														type: "note",
														content: item.content,
													})
												}
											>
												<FileText />
												<span>{item.name}</span>
											</CommandItem>
										),
									)}
									{pinnedEntitiesResponse?.data?.pinned_entities.characters?.map(
										(item) => (
											<CommandItem
												key={item.id}
												onSelect={() =>
													handleEntitySelect({
														id: item.id,
														name: item.name,
														type: "character",
														content: item.content,
													})
												}
											>
												<User />
												<span>{item.name}</span>
											</CommandItem>
										),
									)}
									{pinnedEntitiesResponse?.data?.pinned_entities.factions?.map(
										(item) => (
											<CommandItem
												key={item.id}
												onSelect={() =>
													handleEntitySelect({
														id: item.id,
														name: item.name,
														type: "faction",
														content: item.content,
													})
												}
											>
												<Shield />
												<span>{item.name}</span>
											</CommandItem>
										),
									)}
									{pinnedEntitiesResponse?.data?.pinned_entities.locations?.map(
										(item) => (
											<CommandItem
												key={item.id}
												onSelect={() =>
													handleEntitySelect({
														id: item.id,
														name: item.name,
														type: "location",
														content: item.content,
													})
												}
											>
												<MapPin />
												<span>{item.name}</span>
											</CommandItem>
										),
									)}
									{pinnedEntitiesResponse?.data?.pinned_entities.quests?.map(
										(item) => (
											<CommandItem
												key={item.id}
												onSelect={() =>
													handleEntitySelect({
														id: item.id,
														name: item.name,
														type: "quest",
														content: item.content,
													})
												}
											>
												<Gem />
												<span>{item.name}</span>
											</CommandItem>
										),
									)}
								</>
							)}
						</CommandGroup>
						<CommandGroup heading="Characters">
							<CommandItem
								onSelect={() => {
									setIsCommanderOpen(false);
									navigate({
										to: "/games/$gameId/characters",
										params: { gameId },
									});
								}}
							>
								<Users />
								<span className="font-semibold">All Characters</span>
							</CommandItem>
							<CommandItem
								onSelect={() => {
									setIsCommanderOpen(false);
									setIsCreateCharacterOpen(true);
								}}
							>
								<Plus />
								<span>New Character</span>
								<CommandShortcut>⌘⇧C</CommandShortcut>
							</CommandItem>
							{characters?.map((character) => (
								<CommandItem
									key={character.id}
									onSelect={() =>
										handleEntitySelect({
											id: character.id,
											name: character.name,
											type: "character",
											content: character.content,
										})
									}
								>
									<div className="flex items-center justify-between w-full">
										<div className="flex items-center gap-2">
											<User />
											<span>{character.name}</span>
										</div>
										<Badge size={"sm"} variant={"secondary"}>
											{character.class}
										</Badge>
									</div>
								</CommandItem>
							))}
						</CommandGroup>
						<CommandSeparator />
						<CommandGroup heading="Factions">
							<CommandItem
								onSelect={() => {
									setIsCommanderOpen(false);
									navigate({
										to: "/games/$gameId/factions",
										params: { gameId },
									});
								}}
							>
								<Shield />
								<span className="font-semibold">All Factions</span>
							</CommandItem>
							<CommandItem
								onSelect={() => {
									setIsCommanderOpen(false);
									setIsCreateFactionOpen(true);
								}}
							>
								<Plus />
								<span>New Faction</span>
								<CommandShortcut>⌘⇧F</CommandShortcut>
							</CommandItem>
							{factions?.map((faction) => (
								<CommandItem
									key={faction.id}
									onSelect={() =>
										handleEntitySelect({
											id: faction.id,
											name: faction.name,
											type: "faction",
											content: faction.content,
										})
									}
								>
									<Shield />
									<span>{faction.name}</span>
								</CommandItem>
							))}
						</CommandGroup>
						<CommandSeparator />
						<CommandGroup heading="Locations">
							<CommandItem
								onSelect={() => {
									setIsCommanderOpen(false);
									navigate({
										to: "/games/$gameId/locations",
										params: { gameId },
									});
								}}
							>
								<MapPin />
								<span className="font-semibold">All Locations</span>
							</CommandItem>
							<CommandItem
								onSelect={() => {
									setIsCommanderOpen(false);
									setIsCreateLocationOpen(true);
								}}
							>
								<Plus />
								<span>New Location</span>
								<CommandShortcut>⌘⇧L</CommandShortcut>
							</CommandItem>
							{locations?.map((location) => (
								<CommandItem
									key={location.id}
									onSelect={() =>
										handleEntitySelect({
											id: location.id,
											name: location.name,
											type: "location",
											content: location.content,
										})
									}
								>
									<MapPin />
									<span>{location.name}</span>
								</CommandItem>
							))}
						</CommandGroup>
						<CommandSeparator />
						<CommandGroup heading="Notes">
							<CommandItem
								onSelect={() => {
									setIsCommanderOpen(false);
									navigate({
										to: "/games/$gameId/notes",
										params: { gameId },
									});
								}}
							>
								<FileText />
								<span className="font-semibold">All Notes</span>
							</CommandItem>
							<CommandItem
								onSelect={() => {
									setIsCommanderOpen(false);
									setIsCreateNoteOpen(true);
								}}
							>
								<Plus />
								<span>New Note</span>
								<CommandShortcut>⌘⇧N</CommandShortcut>
							</CommandItem>
							{notes?.map((note) => (
								<CommandItem
									key={note.id}
									onSelect={() =>
										handleEntitySelect({
											id: note.id,
											name: note.name,
											type: "note",
											content: note.content,
										})
									}
								>
									<FileText />
									<span>{note.name}</span>
								</CommandItem>
							))}
						</CommandGroup>
						<CommandSeparator />
						<CommandGroup heading="Quests">
							<CommandItem
								onSelect={() => {
									setIsCommanderOpen(false);
									navigate({
										to: "/games/$gameId/quests",
										params: { gameId },
									});
								}}
							>
								<Sword />
								<span className="font-semibold">All Quests</span>
							</CommandItem>
							<CommandItem
								onSelect={() => {
									setIsCommanderOpen(false);
									setIsCreateQuestOpen(true);
								}}
							>
								<Plus />
								<span>New Quest</span>
								<CommandShortcut>⌘⇧Q</CommandShortcut>
							</CommandItem>
							{quests?.map((quest) => (
								<CommandItem
									key={quest.id}
									onSelect={() =>
										handleEntitySelect({
											id: quest.id,
											name: quest.name,
											type: "quest",
											content: quest.content,
										})
									}
								>
									<Sword />
									<span>{quest.name}</span>
								</CommandItem>
							))}
						</CommandGroup>
						<CommandSeparator />
						<CommandGroup heading="Todos">
							<CommandItem
								onSelect={() => {
									setIsCommanderOpen(false);
									setIsTodoDrawerOpen(true);
								}}
							>
								<CheckSquare />
								<span>Todos</span>
								<CommandShortcut>⌘⇧T</CommandShortcut>
							</CommandItem>
						</CommandGroup>
					</>
				)}
			</CommandList>
		</CommandDialog>
	);
}

export function CommanderTrigger() {
	const { setIsCommanderOpen } = useUIActions();
	return (
		<div className="flex-1 max-w-md">
			<button
				type="button"
				onClick={() => setIsCommanderOpen(true)}
				className="relative w-full h-10 px-3 py-2 text-left text-sm bg-background border border-input rounded-md hover:ring-2 hover:ring-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer flex items-center"
			>
				<Search className="mr-3 w-4 h-4 text-muted-foreground" />
				<span className="text-muted-foreground">Search entities...</span>
				<Badge variant="secondary" className="ml-auto text-xs">
					⌘K
				</Badge>
			</button>
		</div>
	);
}
