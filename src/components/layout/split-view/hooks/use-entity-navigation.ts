import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import type { EntityType } from "~/types";

interface UseEntityNavigationParams {
	gameId: string;
}

interface UseEntityNavigationResult {
	openFullView: (entityType: EntityType, entityId: string) => void;
	refreshEntity: (entityType: EntityType, entityId: string) => void;
}

export function useEntityNavigation({
	gameId,
}: UseEntityNavigationParams): UseEntityNavigationResult {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const openFullView = useCallback(
		(entityType: EntityType, entityId: string) => {
			const routeMap = {
				character: "/games/$gameId/characters/$id" as const,
				faction: "/games/$gameId/factions/$id" as const,
				location: "/games/$gameId/locations/$id" as const,
				note: "/games/$gameId/notes/$id" as const,
				quest: "/games/$gameId/quests/$id" as const,
			};

			const route = routeMap[entityType];
			if (route) {
				navigate({
					to: route,
					params: { gameId, id: entityId },
				});
			}
		},
		[navigate, gameId],
	);

	const refreshEntity = useCallback(
		(entityId: string) => {
			// Invalidate queries for this specific entity
			queryClient.invalidateQueries({
				predicate: (query) => {
					const queryKey = query.queryKey;
					return (
						Array.isArray(queryKey) &&
						queryKey.some(
							(key) =>
								typeof key === "object" &&
								key !== null &&
								"path" in key &&
								typeof key.path === "object" &&
								key.path !== null &&
								"game_id" in key.path &&
								key.path.game_id === gameId &&
								Object.values(key.path).includes(entityId),
						)
					);
				},
			});
		},
		[queryClient, gameId],
	);

	return {
		openFullView,
		refreshEntity,
	};
}
