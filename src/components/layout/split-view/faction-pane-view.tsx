import { useQuery } from "@tanstack/react-query";
import { getFactionOptions } from "~/api/@tanstack/react-query.gen";
import type { Faction } from "~/api/types.gen";
import { useUpdateFactionMutation } from "~/queries/factions";
import type { EntityMutationPayload } from "~/types/split-view";
import { EntityContentRenderer } from "./entity-content-renderer";
import { useEntityNavigation } from "./hooks";

interface FactionPaneViewProps {
	gameId: string;
	factionId: string;
	onClearEntity: () => void;
	onAddEntity: () => void;
}

export function FactionPaneView({
	gameId,
	factionId,
	onClearEntity,
	onAddEntity,
}: FactionPaneViewProps) {
	const {
		data: factionResponse,
		isLoading,
		isError,
	} = useQuery(
		getFactionOptions({
			path: { game_id: gameId, id: factionId },
		}),
	);

	const { mutateAsync } = useUpdateFactionMutation(gameId, factionId);
	const { openFullView, refreshEntity } = useEntityNavigation({ gameId });

	const handleSave = async (payload: EntityMutationPayload) => {
		await mutateAsync({
			body: { faction: payload },
			path: { game_id: gameId, id: factionId },
		});
	};

	const handleRefresh = () => {
		refreshEntity("faction", factionId);
	};

	const handleOpenFullView = () => {
		openFullView("faction", factionId);
	};

	// Transform API faction to match our component's expected format
	const faction: Faction | undefined = factionResponse?.data;

	return (
		<EntityContentRenderer
			entity={faction}
			entityType="faction"
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
