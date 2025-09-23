import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	deleteNoteMutation,
	getNoteOptions,
	getNoteQueryKey,
	listNotesOptions,
	listNotesQueryKey,
	updateNoteMutation,
} from "~/api/@tanstack/react-query.gen";

////////////////////////////////////////////////////////////////////////////////
//                                QUERIES
////////////////////////////////////////////////////////////////////////////////

export const useListNotesSuspenseQuery = (gameId: string) => {
	return useSuspenseQuery(listNotesOptions({ path: { game_id: gameId } }));
};

export const useNoteSuspenseQuery = (gameId: string, id: string) => {
	return useSuspenseQuery(getNoteOptions({ path: { game_id: gameId, id } }));
};

////////////////////////////////////////////////////////////////////////////////
//                                MUTATIONS
////////////////////////////////////////////////////////////////////////////////

export const useDeleteNoteMutation = (gameId: string) => {
	const navigate = useNavigate();
	const client = useQueryClient();
	return useMutation({
		...deleteNoteMutation(),
		onSuccess: () => {
			client.invalidateQueries({
				queryKey: listNotesQueryKey({
					path: { game_id: gameId },
				}),
			});
			navigate({ to: ".." });
		},
	});
};

export const useUpdateNoteMutation = (gameId: string, noteId: string) => {
	const client = useQueryClient();
	return useMutation({
		...updateNoteMutation(),
		onSuccess: () => {
			client.invalidateQueries({
				queryKey: getNoteQueryKey({
					path: { game_id: gameId, id: noteId },
				}),
			});
		},
	});
};
