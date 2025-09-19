import { CreateLinkForm } from "../links";
import { Button } from "../ui/button";
import {
	Popover,
	PopoverContent,
	PopoverPositioner,
	PopoverTrigger,
} from "../ui/popover";

interface CreateFactionLinkProps {
	gameId: string;
	factionId: string;
}

export function CreateFactionLink({ gameId, factionId }: CreateFactionLinkProps) {
	return (
		<Popover>
			<PopoverTrigger render={<Button />}>Create Link</PopoverTrigger>
			<PopoverPositioner align="start">
				<PopoverContent>
					<CreateLinkForm
						gameId={gameId}
						sourceEntityType="faction"
						sourceEntityId={factionId}
					/>
				</PopoverContent>
			</PopoverPositioner>
		</Popover>
	);
}
