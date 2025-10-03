import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	deleteCharacterMutation,
	getCharacterLinksQueryKey,
	getCharacterOptions,
	getCharacterQueryKey,
	listCharactersOptions,
	listCharactersQueryKey,
	setCharacterPrimaryFactionMutation,
	updateCharacterMutation,
} from "~/api/@tanstack/react-query.gen";

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

export const useDeleteCharacterMutation = (gameId: string) => {
	const navigate = useNavigate();
	const client = useQueryClient();
	return useMutation({
		...deleteCharacterMutation(),
		onSuccess: () => {
			client.invalidateQueries({
				queryKey: listCharactersQueryKey({
					path: { game_id: gameId },
				}),
			});
			navigate({ to: ".." });
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
				queryKey: getCharacterLinksQueryKey({
					path: { game_id: gameId, character_id: characterId },
				}),
			});
			client.invalidateQueries({
				queryKey: getCharacterQueryKey({
					path: { game_id: gameId, id: characterId },
				}),
			});
		},
	});
};
