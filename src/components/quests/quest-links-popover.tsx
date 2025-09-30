import { Button } from "../ui/button";
import {
	Popover,
	PopoverContent,
	PopoverPositioner,
	PopoverTrigger,
} from "../ui/popover";
import { CreateQuestLink } from "./create-quest-link";

interface QuestLinksPopoverProps {
	gameId: string;
	questId: string;
}

export function QuestLinksPopover({ gameId, questId }: QuestLinksPopoverProps) {
	return (
		<Popover>
			<PopoverTrigger render={<Button />}>Create Link</PopoverTrigger>
			<PopoverPositioner align="start">
				<PopoverContent>
					<CreateQuestLink gameId={gameId} questId={questId} />
				</PopoverContent>
			</PopoverPositioner>
		</Popover>
	);
}
