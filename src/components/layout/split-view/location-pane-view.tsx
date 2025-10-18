import { useQuery } from "@tanstack/react-query";
import { getLocationOptions } from "~/api/@tanstack/react-query.gen";
import type { Location } from "~/api/types.gen";
import { useUpdateLocationMutation } from "~/queries/locations";
import type { EntityMutationPayload } from "~/types/split-view";
import { EntityContentRenderer } from "./entity-content-renderer";
import { useEntityNavigation } from "./hooks";

interface LocationPaneViewProps {
	gameId: string;
	locationId: string;
	onClearEntity: () => void;
	onAddEntity: () => void;
}

export function LocationPaneView({
	gameId,
	locationId,
	onClearEntity,
	onAddEntity,
}: LocationPaneViewProps) {
	const {
		data: locationResponse,
		isLoading,
		isError,
	} = useQuery(
		getLocationOptions({
			path: { game_id: gameId, id: locationId },
		}),
	);

	const { mutateAsync } = useUpdateLocationMutation(gameId, locationId);
	const { openFullView, refreshEntity } = useEntityNavigation({ gameId });

	const handleSave = async (payload: EntityMutationPayload) => {
		await mutateAsync({
			body: { location: payload },
			path: { game_id: gameId, id: locationId },
		});
	};

	const handleRefresh = () => {
		refreshEntity("location", locationId);
	};

	const handleOpenFullView = () => {
		openFullView("location", locationId);
	};

	// Transform API location to match our component's expected format
	const location: Location | undefined = locationResponse?.data;

	return (
		<EntityContentRenderer
			entity={location}
			entityType="location"
			gameId={gameId}
			onSave={handleSave}
			isLoading={isLoading}
			isError={isError}
			onClearEntity={onClearEntity}
			onAddEntity={onAddEntity}
			onRefresh={handleRefresh}
			onOpenFullView={handleOpenFullView}
		/>
	);
}
