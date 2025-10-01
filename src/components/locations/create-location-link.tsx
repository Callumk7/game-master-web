import { CreateLinkForm } from "../links";
import { Button } from "../ui/button";
import {
	Popover,
	PopoverContent,
	PopoverPositioner,
	PopoverTrigger,
} from "../ui/popover";

interface CreateLocationLinkProps {
	gameId: string;
	locationId: string;
}

export function CreateLocationLink({ gameId, locationId }: CreateLocationLinkProps) {
	return (
		<Popover>
			<PopoverTrigger render={<Button />}>Create Link</PopoverTrigger>
			<PopoverPositioner align="start">
				<PopoverContent>
					<CreateLinkForm
						gameId={gameId}
						sourceEntityType="location"
						sourceEntityId={locationId}
					/>
				</PopoverContent>
			</PopoverPositioner>
		</Popover>
	);
}
