import { SquareArrowDownRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useUIActions } from "~/state/ui";
import type { EntityLink } from "./types";

interface EntityLinkButtonProps {
	entity: EntityLink;
}

export function EntityLinkButton({ entity }: EntityLinkButtonProps) {
	const { openEntityWindow } = useUIActions();

	return (
		<Button variant="ghost" onClick={() => openEntityWindow(entity)}>
			<SquareArrowDownRight className="h-4 w-4" />
		</Button>
	);
}
