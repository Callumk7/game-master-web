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

export function Commander({ gameId }: { gameId: string }) {
	const [open, setOpen] = React.useState(false);

	const navigate = useNavigate();

	const { data: links, isLoading: linksLoading } = useGetGameLinksSuspenseQuery({
		id: gameId,
	});
	const characters = links?.data?.entities?.characters;
	const factions = links?.data?.entities?.factions;
	const locations = links?.data?.entities?.locations;
	const notes = links?.data?.entities?.notes;
	const quests = links?.data?.entities?.quests;

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};

		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	return (
		<CommandDialog open={open} onOpenChange={setOpen}>
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
									setOpen(false);
									navigate({
										to: "/games/$gameId/characters/new",
										params: { gameId },
									});
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
										setOpen(false);
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
							{factions?.map((faction) => (
								<CommandItem
									key={faction.id}
									onSelect={() => {
										setOpen(false);
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
							{locations?.map((location) => (
								<CommandItem
									key={location.id}
									onSelect={() => {
										setOpen(false);
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
							{notes?.map((note) => (
								<CommandItem
									key={note.id}
									onSelect={() => {
										setOpen(false);
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
							{quests?.map((quest) => (
								<CommandItem
									key={quest.id}
									onSelect={() => {
										setOpen(false);
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
					</>
				)}
			</CommandList>
		</CommandDialog>
	);
}
