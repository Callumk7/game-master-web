import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {
	deleteNoteMutation,
	getNoteOptions,
	getNoteQueryKey,
	listGameEntitiesQueryKey,
	listNotesOptions,
	listNotesQueryKey,
	updateNoteMutation,
} from "~/api/@tanstack/react-query.gen";
import { useEntityTabs } from "~/components/entity-tabs";

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

export const useDeleteNoteMutation = (gameId: string, noteId: string) => {
	const client = useQueryClient();
	const { removeTab } = useEntityTabs();
	return useMutation({
		...deleteNoteMutation(),
		onSuccess: () => {
			client.invalidateQueries({
				queryKey: listNotesQueryKey({
					path: { game_id: gameId },
				}),
			});
			client.invalidateQueries({
				queryKey: listGameEntitiesQueryKey({
					path: { game_id: gameId },
				}),
			});
			client.removeQueries({
				queryKey: getNoteQueryKey({
					path: { game_id: gameId, id: noteId },
				}),
			});
			removeTab(noteId);
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
