import { useUpdateCharacterMutation } from "~/queries/characters";
import { useUpdateFactionMutation } from "~/queries/factions";
import { useUpdateLocationMutation } from "~/queries/locations";
import { useUpdateNoteMutation } from "~/queries/notes";
import { useUpdateQuestMutation } from "~/queries/quests";
import type { EntityMutationPayload, EntityType } from "~/types/split-view";

interface UseEntityMutationsParams {
	gameId: string;
	entityType: EntityType;
	entityId: string;
}

interface EntityMutationResult {
	mutate: (payload: EntityMutationPayload) => void;
	mutateAsync: (payload: EntityMutationPayload) => Promise<any>;
	isPending: boolean;
	isError: boolean;
	error: Error | null;
}

export function useEntityMutations({
	gameId,
	entityType,
	entityId,
}: UseEntityMutationsParams): EntityMutationResult {
	const characterMutation = useUpdateCharacterMutation(gameId, entityId);
	const factionMutation = useUpdateFactionMutation(gameId, entityId);
	const locationMutation = useUpdateLocationMutation(gameId, entityId);
	const noteMutation = useUpdateNoteMutation(gameId, entityId);
	const questMutation = useUpdateQuestMutation(gameId, entityId);

	const getCurrentMutation = () => {
		switch (entityType) {
			case "characters":
				return characterMutation;
			case "factions":
				return factionMutation;
			case "locations":
				return locationMutation;
			case "notes":
				return noteMutation;
			case "quests":
				return questMutation;
			default:
				throw new Error(`Unsupported entity type: ${entityType}`);
		}
	};

	const mutation = getCurrentMutation();

	const mutate = (payload: EntityMutationPayload) => {
		const path = { game_id: gameId, id: entityId };
		switch (entityType) {
			case "characters":
				return characterMutation.mutate({ body: { character: payload }, path });
			case "factions":
				return factionMutation.mutate({ body: { faction: payload }, path });
			case "locations":
				return locationMutation.mutate({ body: { location: payload }, path });
			case "notes":
				return noteMutation.mutate({ body: { note: payload }, path });
			case "quests":
				return questMutation.mutate({ body: { quest: payload }, path });
			default:
				throw new Error(`Unsupported entity type: ${entityType}`);
		}
	};

	const mutateAsync = async (payload: EntityMutationPayload) => {
		const path = { game_id: gameId, id: entityId };
		switch (entityType) {
			case "characters":
				return characterMutation.mutateAsync({
					body: { character: payload },
					path,
				});
			case "factions":
				return factionMutation.mutateAsync({ body: { faction: payload }, path });
			case "locations":
				return locationMutation.mutateAsync({
					body: { location: payload },
					path,
				});
			case "notes":
				return noteMutation.mutateAsync({ body: { note: payload }, path });
			case "quests":
				return questMutation.mutateAsync({ body: { quest: payload }, path });
			default:
				throw new Error(`Unsupported entity type: ${entityType}`);
		}
	};

	return {
		mutate,
		mutateAsync,
		isPending: mutation.isPending,
		isError: mutation.isError,
		error: mutation.error as Error | null,
	};
}
