import { Button } from "../ui/button";
import {
	Popover,
	PopoverContent,
	PopoverPositioner,
	PopoverTrigger,
} from "../ui/popover";
import { CreateCharacterLink } from "./CreateCharacterLink";

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
