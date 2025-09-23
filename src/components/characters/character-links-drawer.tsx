import type { Character } from "~/api";
import { useGetCharacterLinks } from "~/queries/characters";
import { flattenLinksForTable, type GenericLinksResponse } from "~/utils/linkHelpers";
import { Button } from "../ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "../ui/drawer";
import { EntityLinksTable } from "../ui/entity-links-table";
import { CreateCharacterLink } from "./create-character-link";

interface CharacterLinksDrawerProps {
	character: Character;
	gameId: string;
}

export function CharacterLinksDrawer({ character, gameId }: CharacterLinksDrawerProps) {
	const {
		data: linksResponse,
		isLoading: linksLoading,
		isError: linksError,
		error: linksQueryError,
	} = useGetCharacterLinks(gameId, character.id);

	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button>Links</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Links</DrawerTitle>
				</DrawerHeader>
				<div className="space-y-4 p-10">
					<h2 className="text-lg font-semibold">Links</h2>
					<CreateCharacterLink gameId={gameId} characterId={character.id} />
					{linksLoading && (
						<div className="text-muted-foreground">Loading links...</div>
					)}
					{linksError && (
						<div className="text-destructive">
							Error loading links: {linksQueryError?.message}
						</div>
					)}
					{!linksLoading && !linksError && linksResponse && (
						<EntityLinksTable
							links={flattenLinksForTable(
								linksResponse as GenericLinksResponse,
							)}
							gameId={gameId}
						/>
					)}
				</div>
			</DrawerContent>
		</Drawer>
	);
}
