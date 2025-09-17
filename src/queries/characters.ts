import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	deleteCharacterMutation,
	getCharacterOptions,
	getCharacterQueryKey,
	listCharactersOptions,
	listCharactersQueryKey,
	updateCharacterMutation,
} from "~/api/@tanstack/react-query.gen";

////////////////////////////////////////////////////////////////////////////////
//                                QUERIES
////////////////////////////////////////////////////////////////////////////////

export const useListCharactersQuery = (gameId: string) => {
	return useSuspenseQuery({ ...listCharactersOptions({ path: { game_id: gameId } }) });
};

export const useCharacterQuery = (gameId: string, id: string) => {
	return useSuspenseQuery({
		...getCharacterOptions({ path: { game_id: gameId, id } }),
	});
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
