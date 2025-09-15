import { CreateLinkForm } from "../links";

interface CreateLocationLinkProps {
	gameId: string;
	locationId: string;
}

export function CreateLocationLink({ gameId, locationId }: CreateLocationLinkProps) {
	return (
		<CreateLinkForm
			gameId={gameId}
			sourceEntityType="location"
			sourceEntityId={locationId}
			excludeTypes={["location"]}
		/>
	);
}
