import { useQuery } from "@tanstack/react-query";
import { getCharacterOptions } from "~/api/@tanstack/react-query.gen";
import type { Character } from "~/api/types.gen";
import { useUpdateCharacterMutation } from "~/queries/characters";
import type { EntityMutationPayload } from "~/types/split-view";
import { EntityContentRenderer } from "./entity-content-renderer";
import { useEntityNavigation } from "./hooks";

interface CharacterPaneViewProps {
	gameId: string;
	characterId: string;
	onClearEntity: () => void;
	onAddEntity: () => void;
}

export function CharacterPaneView({
	gameId,
	characterId,
	onClearEntity,
	onAddEntity,
}: CharacterPaneViewProps) {
	const {
		data: characterResponse,
		isLoading,
		isError,
	} = useQuery(
		getCharacterOptions({
			path: { game_id: gameId, id: characterId },
		}),
	);

	const { mutateAsync } = useUpdateCharacterMutation(gameId, characterId);
	const { openFullView, refreshEntity } = useEntityNavigation({ gameId });

	const handleSave = async (payload: EntityMutationPayload) => {
		await mutateAsync({
			body: { character: payload },
			path: { game_id: gameId, id: characterId },
		});
	};

	const handleRefresh = () => {
		refreshEntity("character", characterId);
	};

	const handleOpenFullView = () => {
		openFullView("character", characterId);
	};

	// Transform API character to match our component's expected format
	const character: Character | undefined = characterResponse?.data;

	return (
		<EntityContentRenderer
			entity={character}
			entityType="character"
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
