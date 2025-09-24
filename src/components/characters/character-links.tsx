import { Button } from "../ui/button";
import {
	Popover,
	PopoverContent,
	PopoverPositioner,
	PopoverTrigger,
} from "../ui/popover";
import { CreateCharacterLink } from "./create-character-link";

interface CharacterLinksProps {
	gameId: string;
	characterId: string;
}

export function CharacterLinksPopover({ gameId, characterId }: CharacterLinksProps) {
	return (
		<Popover>
			<PopoverTrigger render={<Button />}>Create Link</PopoverTrigger>
			<PopoverPositioner align="start">
				<PopoverContent>
					<CreateCharacterLink gameId={gameId} characterId={characterId} />
				</PopoverContent>
			</PopoverPositioner>
		</Popover>
	);
}
