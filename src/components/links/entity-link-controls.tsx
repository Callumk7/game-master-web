import type { EntityType } from "~/types";
import { DeleteLink } from "./delete-link";
import { EntityLinkButton } from "./entity-link-button";
import type { EntityLink } from "./types";
import { UpdateLinkDialog } from "./update-link-dialog";

interface EntityLinkControlsProps {
	gameId: string;
	sourceId: string;
	sourceType: EntityType;
	link: EntityLink;
}

export function EntityLinkControls({
	gameId,
	sourceId,
	sourceType,
	link,
}: EntityLinkControlsProps) {
	return (
		<div className="flex gap-1">
			<EntityLinkButton entity={link} />
			<UpdateLinkDialog
				link={link}
				gameId={gameId}
				sourceId={sourceId}
				sourceType={sourceType}
			/>
			<DeleteLink
				gameId={gameId}
				sourceId={sourceId}
				sourceType={sourceType}
				targetId={link.id}
				targetType={link.type}
			/>
		</div>
	);
}
