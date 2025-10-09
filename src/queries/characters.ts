import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {
	deleteCharacterMutation,
	getCharacterOptions,
	getCharacterQueryKey,
	listCharactersOptions,
	listCharactersQueryKey,
	listGameEntitiesQueryKey,
	removeCharacterPrimaryFactionMutation,
	setCharacterPrimaryFactionMutation,
	updateCharacterMutation,
} from "~/api/@tanstack/react-query.gen";
import { useEntityTabs } from "~/components/entity-tabs";

////////////////////////////////////////////////////////////////////////////////
//                                SUSPENSE
////////////////////////////////////////////////////////////////////////////////

export const useGetCharacterSuspenseQuery = (gameId: string, id: string) => {
	return useSuspenseQuery(getCharacterOptions({ path: { game_id: gameId, id } }));
};

export const useListCharactersSuspenseQuery = (gameId: string) => {
	return useSuspenseQuery(listCharactersOptions({ path: { game_id: gameId } }));
};

////////////////////////////////////////////////////////////////////////////////
//                                MUTATIONS
////////////////////////////////////////////////////////////////////////////////

export const useDeleteCharacterMutation = (gameId: string, characterId: string) => {
	const client = useQueryClient();
	const { removeTab } = useEntityTabs();
	return useMutation({
		...deleteCharacterMutation(),
		onSuccess: () => {
			client.invalidateQueries({
				queryKey: listCharactersQueryKey({
					path: { game_id: gameId },
				}),
			});
			client.invalidateQueries({
				queryKey: listGameEntitiesQueryKey({
					path: { game_id: gameId },
				}),
			});
			client.removeQueries({
				queryKey: getCharacterQueryKey({
					path: { game_id: gameId, id: characterId },
				}),
			});
			removeTab(characterId);
		},
	});
};

export const useUpdateCharacterMutation = (gameId: string, characterId: string) => {
	const client = useQueryClient();
	return useMutation({
		...updateCharacterMutation(),
		onSuccess: () => {
			client.invalidateQueries({
				queryKey: getCharacterQueryKey({
					path: { game_id: gameId, id: characterId },
				}),
			});
		},
	});
};

export const useSetCharacterPrimaryFactionMutation = (
	gameId: string,
	characterId: string,
) => {
	const client = useQueryClient();
	return useMutation({
		...setCharacterPrimaryFactionMutation(),
		onSuccess: () => {
			client.invalidateQueries({
				queryKey: getCharacterQueryKey({
					path: { game_id: gameId, id: characterId },
				}),
			});
		},
	});
};

export const useRemoveCharacterFromFactionMutation = (
	gameId: string,
	characterId: string,
) => {
	const client = useQueryClient();
	return useMutation({
		...removeCharacterPrimaryFactionMutation(),
		onSuccess: () => {
			client.invalidateQueries({
				queryKey: getCharacterQueryKey({
					path: { game_id: gameId, id: characterId },
				}),
			});
		},
	});
};
