import { CreateLinkForm } from "../links";
import { Button } from "../ui/button";
import {
	Popover,
	PopoverContent,
	PopoverPositioner,
	PopoverTrigger,
} from "../ui/popover";

interface CreateCharacterLinkProps {
	gameId: string;
	characterId: string;
}

export function CreateCharacterLink({ gameId, characterId }: CreateCharacterLinkProps) {
	return (
		<Popover>
			<PopoverTrigger render={<Button />}>Create Link</PopoverTrigger>
			<PopoverPositioner align="start">
				<PopoverContent>
					<CreateLinkForm
						gameId={gameId}
						sourceEntityType="character"
						sourceEntityId={characterId}
					/>
				</PopoverContent>
			</PopoverPositioner>
		</Popover>
	);
}
