import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	deleteCharacter,
	deleteFaction,
	deleteLocation,
	deleteNote,
	deleteQuest,
	updateCharacter,
	updateFaction,
	updateLocation,
	updateNote,
	updateQuest,
} from "~/api";
import {
	deleteCharacterLinkMutation,
	deleteFactionLinkMutation,
	deleteLocationLinkMutation,
	deleteNoteLinkMutation,
	deleteQuestLinkMutation,
	getCharacterLinksQueryKey,
	getCharacterQueryKey,
	getFactionLinksQueryKey,
	getFactionQueryKey,
	getLocationLinksQueryKey,
	getLocationQueryKey,
	getNoteLinksQueryKey,
	getNoteQueryKey,
	getQuestLinksQueryKey,
	getQuestQueryKey,
	updateCharacterLinkMutation,
	updateFactionLinkMutation,
	updateLocationLinkMutation,
	updateNoteLinkMutation,
	updateQuestLinkMutation,
} from "~/api/@tanstack/react-query.gen";
import type { EntityType } from "~/types";

export function getEntityQueryKey(
	entity: { entityId: string; entityType: EntityType },
	gameId: string,
) {
	switch (entity.entityType) {
		case "character":
			return getCharacterQueryKey({
				path: { game_id: gameId, id: entity.entityId },
			});
		case "faction":
			return getFactionQueryKey({
				path: { game_id: gameId, id: entity.entityId },
			});
		case "location":
			return getLocationQueryKey({
				path: { game_id: gameId, id: entity.entityId },
			});
		case "note":
			return getNoteQueryKey({
				path: { game_id: gameId, id: entity.entityId },
			});
		case "quest":
			return getQuestQueryKey({
				path: { game_id: gameId, id: entity.entityId },
			});
		default:
			throw new Error("Invalid entity type");
	}
}

export function getLinkQueryKey(
	link: { linkId: string; linkType: EntityType },
	gameId: string,
) {
	switch (link.linkType) {
		case "character":
			return getCharacterLinksQueryKey({
				path: { game_id: gameId, character_id: link.linkId },
			});
		case "faction":
			return getFactionLinksQueryKey({
				path: { game_id: gameId, faction_id: link.linkId },
			});
		case "location":
			return getLocationLinksQueryKey({
				path: { game_id: gameId, location_id: link.linkId },
			});
		case "note":
			return getNoteLinksQueryKey({
				path: { game_id: gameId, note_id: link.linkId },
			});
		case "quest":
			return getQuestLinksQueryKey({
				path: { game_id: gameId, quest_id: link.linkId },
			});
		default:
			throw new Error("Invalid link type");
	}
}

interface BaseUpdatePayload {
	name?: string;
	tags?: string[];
	pinned?: boolean;
}
type CharacterUpdateVariables = {
	gameId: string;
	entityType: "character";
	entityId: string;
	payload: BaseUpdatePayload & {
		alive?: boolean;
		class?: string;
		level?: number;
		race?: string;
	};
};
type FactionUpdateVariables = {
	gameId: string;
	entityType: "faction";
	entityId: string;
	payload: BaseUpdatePayload;
};
type LocationUpdateVariables = {
	gameId: string;
	entityType: "location";
	entityId: string;
	payload: BaseUpdatePayload & {
		type?:
			| "continent"
			| "nation"
			| "region"
			| "city"
			| "settlement"
			| "building"
			| "complex";
		parent_id?: string;
	};
};
type NoteUpdateVariables = {
	gameId: string;
	entityType: "note";
	entityId: string;
	payload: BaseUpdatePayload;
};
type QuestUpdateVariables = {
	gameId: string;
	entityType: "quest";
	entityId: string;
	payload: BaseUpdatePayload & {
		status?: "preparing" | "ready" | "active" | "paused" | "completed" | "cancelled";
		parent_id?: string;
	};
};
export type UpdateEntityVariables =
	| CharacterUpdateVariables
	| FactionUpdateVariables
	| LocationUpdateVariables
	| NoteUpdateVariables
	| QuestUpdateVariables;

export function useUpdateEntity(
	onSuccess?: () => void,
	onError?: (error: Error) => void,
) {
	return useMutation({
		mutationFn: async (variables: UpdateEntityVariables) => {
			const { entityType, entityId, payload, gameId } = variables;
			const path = {
				game_id: gameId,
				id: entityId,
			};
			switch (entityType) {
				case "character": {
					return updateCharacter({
						path,
						body: {
							character: payload,
						},
					});
				}
				case "faction": {
					return updateFaction({
						path,
						body: { faction: payload },
					});
				}
				case "location": {
					return updateLocation({
						path,
						body: {
							location: payload,
						},
					});
				}
				case "note": {
					return updateNote({ path, body: { note: payload } });
				}
				case "quest": {
					return updateQuest({
						path,
						body: {
							quest: payload,
						},
					});
				}
				default:
					throw new Error(`Unsupported entity type: ${entityType}`);
			}
		},
		onSuccess,
		onError,
	});
}

interface DeleteEntityParams {
	gameId: string;
	entityId: string;
	entityType: EntityType;
}

export function useDeleteEntity(
	onSuccess?: () => void,
	onError?: (error: Error) => void,
) {
	return useMutation({
		mutationFn: async ({ gameId, entityId, entityType }: DeleteEntityParams) => {
			const path = {
				game_id: gameId,
				id: entityId,
			};
			switch (entityType) {
				case "character": {
					return deleteCharacter({ path });
				}
				case "faction": {
					return deleteFaction({ path });
				}
				case "location": {
					return deleteLocation({ path });
				}
				case "note": {
					return deleteNote({ path });
				}
				case "quest": {
					return deleteQuest({ path });
				}
			}
		},
		onSuccess,
		onError,
	});
}

export interface UpdateLinkParams {
	gameId: string;
	sourceType: EntityType;
	sourceId: string;
	targetType: EntityType;
	targetId: string;
	data: {
		relationship_type?: string;
		description?: string;
		is_active?: boolean;
		strength?: number;
		// Special fields for specific link types
		is_current_location?: boolean;
		is_primary?: boolean;
		faction_role?: string;
	};
}

export function useUpdateLink(onSuccess?: () => void, onError?: (error: Error) => void) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			gameId,
			sourceType,
			sourceId,
			targetType,
			targetId,
			data,
		}: UpdateLinkParams) => {
			switch (sourceType) {
				case "character": {
					const path = {
						game_id: gameId,
						character_id: sourceId,
						entity_type: targetType,
						entity_id: targetId,
					};
					const mutation = updateCharacterLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Character link mutation not available");
					}
					return mutation.mutationFn({ path, body: data });
				}
				case "faction": {
					const path = {
						game_id: gameId,
						faction_id: sourceId,
						entity_type: targetType,
						entity_id: targetId,
					};
					const mutation = updateFactionLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Faction link mutation not available");
					}
					return mutation.mutationFn({ path, body: data });
				}
				case "location": {
					const path = {
						game_id: gameId,
						location_id: sourceId,
						entity_type: targetType,
						entity_id: targetId,
					};
					const mutation = updateLocationLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Location link mutation not available");
					}
					return mutation.mutationFn({ path, body: data });
				}
				case "note": {
					const path = {
						game_id: gameId,
						note_id: sourceId,
						entity_type: targetType,
						entity_id: targetId,
					};
					const mutation = updateNoteLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Note link mutation not available");
					}
					return mutation.mutationFn({ path, body: data });
				}
				case "quest": {
					const path = {
						game_id: gameId,
						quest_id: sourceId,
						entity_type: targetType,
						entity_id: targetId,
					};
					const mutation = updateQuestLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Quest link mutation not available");
					}
					return mutation.mutationFn({ path, body: data });
				}
				default:
					throw new Error(`Unsupported entity type: ${sourceType}`);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [{ _id: "listGameEntities" }] });
			queryClient.invalidateQueries({ queryKey: [{ _id: "getCharacterLinks" }] });
			queryClient.invalidateQueries({ queryKey: [{ _id: "getFactionLinks" }] });
			queryClient.invalidateQueries({ queryKey: [{ _id: "getLocationLinks" }] });
			queryClient.invalidateQueries({ queryKey: [{ _id: "getNoteLinks" }] });
			queryClient.invalidateQueries({ queryKey: [{ _id: "getQuestLinks" }] });
			onSuccess?.();
		},
		onError,
	});
}

export interface DeleteLinkParams {
	gameId: string;
	sourceType: EntityType;
	sourceId: string;
	targetType: EntityType;
	targetId: string;
}
export function useDeleteLink(onSuccess?: () => void, onError?: (error: Error) => void) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			gameId,
			sourceType,
			sourceId,
			targetType,
			targetId,
		}: DeleteLinkParams) => {
			console.log(targetType, targetId);
			console.log(sourceType, sourceId);

			switch (sourceType) {
				case "character": {
					const path = {
						game_id: gameId,
						character_id: sourceId,
						entity_type: targetType,
						entity_id: targetId,
					};
					const mutation = deleteCharacterLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Character link mutation not available");
					}
					return mutation.mutationFn({ path });
				}
				case "faction": {
					const path = {
						game_id: gameId,
						faction_id: sourceId,
						entity_type: targetType,
						entity_id: targetId,
					};
					const mutation = deleteFactionLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Faction link mutation not available");
					}
					return mutation.mutationFn({ path });
				}
				case "location": {
					const path = {
						game_id: gameId,
						location_id: sourceId,
						entity_type: targetType,
						entity_id: targetId,
					};
					const mutation = deleteLocationLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Location link mutation not available");
					}
					return mutation.mutationFn({ path });
				}
				case "note": {
					const path = {
						game_id: gameId,
						note_id: sourceId,
						entity_type: targetType,
						entity_id: targetId,
					};
					const mutation = deleteNoteLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Note link mutation not available");
					}
					return mutation.mutationFn({ path });
				}
				case "quest": {
					const path = {
						game_id: gameId,
						quest_id: sourceId,
						entity_type: targetType,
						entity_id: targetId,
					};
					const mutation = deleteQuestLinkMutation();
					if (!mutation.mutationFn) {
						throw new Error("Quest link mutation not available");
					}
					return mutation.mutationFn({ path });
				}
				default:
					throw new Error(`Unsupported entity type: ${sourceType}`);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [{ _id: "listGameEntities" }] });
			queryClient.invalidateQueries({ queryKey: [{ _id: "getCharacterLinks" }] });
			queryClient.invalidateQueries({ queryKey: [{ _id: "getFactionLinks" }] });
			queryClient.invalidateQueries({ queryKey: [{ _id: "getLocationLinks" }] });
			queryClient.invalidateQueries({ queryKey: [{ _id: "getNoteLinks" }] });
			queryClient.invalidateQueries({ queryKey: [{ _id: "getQuestLinks" }] });
			onSuccess?.();
		},
		onError,
	});
}
