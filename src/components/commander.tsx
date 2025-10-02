import { useNavigate } from "@tanstack/react-router";
import { User } from "lucide-react";
import * as React from "react";

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
import { useGetGameLinksSuspenseQuery } from "~/queries/games";
import { useIsCommanderOpen, useUIActions } from "~/state/ui";

export function Commander({ gameId }: { gameId: string }) {
	const navigate = useNavigate();

	const { data: links, isLoading: linksLoading } = useGetGameLinksSuspenseQuery({
		id: gameId,
	});
	const characters = links?.data?.entities?.characters;
	const factions = links?.data?.entities?.factions;
	const locations = links?.data?.entities?.locations;
	const notes = links?.data?.entities?.notes;
	const quests = links?.data?.entities?.quests;

	const {
		setIsCommanderOpen,
		setIsCreateCharacterOpen,
		setIsCreateFactionOpen,
		setIsCreateNoteOpen,
		setIsCreateLocationOpen,
		setIsCreateQuestOpen,
		setIsTodoDrawerOpen,
	} = useUIActions();
	const isCommanderOpen = useIsCommanderOpen();

	// biome-ignore lint/correctness/useExhaustiveDependencies: Intent is to set up a global keyboard shortcut
	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setIsCommanderOpen(!isCommanderOpen);
			}
		};

		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	return (
		<CommandDialog open={isCommanderOpen} onOpenChange={setIsCommanderOpen}>
			<CommandInput placeholder="Type a command or search..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				{linksLoading ? (
					<CommandGroup heading="Loading...">
						<CommandItem disabled>
							<span>Loading entities...</span>
						</CommandItem>
					</CommandGroup>
				) : (
					<>
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
								<User />
								<span className="font-semibold">All Characters</span>
							</CommandItem>
							<CommandItem
								onSelect={() => {
									setIsCommanderOpen(false);
									setIsCreateCharacterOpen(true);
								}}
							>
								<User />
								<span>New Character</span>
								<CommandShortcut>⌘C</CommandShortcut>
							</CommandItem>
							{characters?.map((character) => (
								<CommandItem
									key={character.id}
									onSelect={() => {
										setIsCommanderOpen(false);
										navigate({
											to: "/games/$gameId/characters/$id",
											params: { gameId, id: character.id },
										});
									}}
								>
									<User />
									<span>{character.name}</span>
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
								<User />
								<span className="font-semibold">All Factions</span>
							</CommandItem>
							<CommandItem
								onSelect={() => {
									setIsCommanderOpen(false);
									setIsCreateFactionOpen(true);
								}}
							>
								<User />
								<span>New Faction</span>
								<CommandShortcut>⌘F</CommandShortcut>
							</CommandItem>
							{factions?.map((faction) => (
								<CommandItem
									key={faction.id}
									onSelect={() => {
										setIsCommanderOpen(false);
										navigate({
											to: "/games/$gameId/factions/$id",
											params: { gameId, id: faction.id },
										});
									}}
								>
									<User />
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
								<User />
								<span className="font-semibold">All Locations</span>
							</CommandItem>
							<CommandItem
								onSelect={() => {
									setIsCommanderOpen(false);
									setIsCreateLocationOpen(true);
								}}
							>
								<User />
								<span>New Location</span>
								<CommandShortcut>⌘L</CommandShortcut>
							</CommandItem>
							{locations?.map((location) => (
								<CommandItem
									key={location.id}
									onSelect={() => {
										setIsCommanderOpen(false);
										navigate({
											to: "/games/$gameId/locations/$id",
											params: { gameId, id: location.id },
										});
									}}
								>
									<User />
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
								<User />
								<span className="font-semibold">All Notes</span>
							</CommandItem>
							<CommandItem
								onSelect={() => {
									setIsCommanderOpen(false);
									setIsCreateNoteOpen(true);
								}}
							>
								<User />
								<span>New Note</span>
								<CommandShortcut>⌘N</CommandShortcut>
							</CommandItem>
							{notes?.map((note) => (
								<CommandItem
									key={note.id}
									onSelect={() => {
										setIsCommanderOpen(false);
										navigate({
											to: "/games/$gameId/notes/$id",
											params: { gameId, id: note.id },
										});
									}}
								>
									<User />
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
								<User />
								<span className="font-semibold">All Quests</span>
							</CommandItem>
							<CommandItem
								onSelect={() => {
									setIsCommanderOpen(false);
									setIsCreateQuestOpen(true);
								}}
							>
								<User />
								<span>New Quest</span>
								<CommandShortcut>⌘Q</CommandShortcut>
							</CommandItem>
							{quests?.map((quest) => (
								<CommandItem
									key={quest.id}
									onSelect={() => {
										setIsCommanderOpen(false);
										navigate({
											to: "/games/$gameId/quests/$id",
											params: { gameId, id: quest.id },
										});
									}}
								>
									<User />
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
								<span>Todos</span>
							</CommandItem>
						</CommandGroup>
					</>
				)}
			</CommandList>
		</CommandDialog>
	);
}
