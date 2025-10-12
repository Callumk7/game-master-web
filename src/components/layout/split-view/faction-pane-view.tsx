import { useQuery } from "@tanstack/react-query";
import { getFactionOptions } from "~/api/@tanstack/react-query.gen";
import { useUpdateFactionMutation } from "~/queries/factions";
import { EntityContentRenderer } from "./entity-content-renderer";
import type { EntityMutationPayload } from "~/types/split-view";
import type { Faction } from "~/api/types.gen";
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

	const { mutateAsync, isPending } = useUpdateFactionMutation(gameId, factionId);
	const { openFullView, refreshEntity } = useEntityNavigation({ gameId });

	const handleSave = async (payload: EntityMutationPayload) => {
		await mutateAsync({
			body: { faction: payload },
			path: { game_id: gameId, id: factionId },
		});
	};

	const handleRefresh = () => {
		refreshEntity("factions", factionId);
	};

	const handleOpenFullView = () => {
		openFullView("factions", factionId);
	};

	// Transform API faction to match our component's expected format
	const faction: Faction | undefined = factionResponse?.data;

	return (
		<EntityContentRenderer
			entity={faction}
			entityType="factions"
			gameId={gameId}
			onSave={handleSave}
			isSaving={isPending}
			isLoading={isLoading}
			isError={isError}
			onClearEntity={onClearEntity}
			onAddEntity={onAddEntity}
			onRefresh={handleRefresh}
			onOpenFullView={handleOpenFullView}
		/>
	);
}

